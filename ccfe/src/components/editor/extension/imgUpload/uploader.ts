import { Fragment, Node, Slice } from "prosemirror-model"
import "prosemirror-replaceattrs" /// register it
import { Plugin } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import type { ImageUploaderPluginOptions } from "./uploadExtension"
import { STATIC_URL } from "@/config"

let plugin: ImageUploaderPlugin | null = null
const fileCache: { [key: string]: File | string } = {}

export function imageUploader(options: ImageUploaderPluginOptions) {
  plugin = new ImageUploaderPlugin(options)
  const dummy = {}

  return new Plugin({
    props: {
      handleDOMEvents: {
        keydown(view) {
          return !plugin?.setView(view)
        },

        drop(view) {
          return !plugin?.setView(view)
        },

        focus(view) {
          return !plugin?.setView(view)
        },
      },

      handlePaste(view, event) {
        console.log("handlePaste", view, event)
        return plugin?.setView(view).handlePaste(event) || false
      },
      // 将粘贴或拖放的内容应用于文档之前对其进行转换
      transformPasted(slice) {
        console.log("transformPasted", slice)
        /// Workaround for missing view is provided above.
        return plugin?.transformPasted(slice) || slice
      },

      // 被拖拽到编辑器上时调用: 当前编辑器中拖拽，则 moved 为 true，从外部拖拽到编辑器中则为 false，event 为拖拽事件
      handleDrop(view, event, slice, moved) {
        // return false，不作处理，应用默认的行为
        console.log("handleDrop", view, event, slice, moved)
        return moved ? false : plugin?.setView(view).handleDrop(event as DragEvent) || false
      },
    },

    state: {
      init() {
        return dummy
      },

      apply(tr, _value, _oldState, newState) {
        const filesOrUrls = tr.getMeta("uploadImages")

        if (filesOrUrls) {
          const arr: Array<File | string> =
            typeof filesOrUrls === "string" || filesOrUrls instanceof File
              ? [filesOrUrls]
              : Array.from(filesOrUrls) /// Probably a FileList or an array of files/urls

          // give some time for editor, otherwise history plugin forgets history
          setTimeout(() => {
            arr.forEach((item, i) => plugin?.beforeUpload(item, newState.selection.from + i))
            tr.setMeta("uploadImages", undefined)
          }, 10)
        }

        return dummy
      },
    },
  })
}

export class ImageUploaderPlugin {
  public view!: EditorView

  constructor(public config: ImageUploaderPluginOptions) {}

  public handleDrop(event: DragEvent) {
    if (!event.dataTransfer?.files.length) return

    const coordinates = this.view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    })
    if (!coordinates) return

    const imageFiles = Array.from(event.dataTransfer.files).filter((file) =>
      this.config.acceptMimes.includes(file.type)
    )
    if (!imageFiles.length) return

    imageFiles.forEach((file, i) => {
      this.beforeUpload(file, coordinates.pos + i)
    })

    return true
  }

  // 网页
  public transformPasted(slice: Slice) {
    const imageNodes: Array<{ url: string; id: string }> = []

    const children: Node[] = []
    slice.content.forEach((child) => {
      let newChild = child

      if (child.type.name === "image") {
        // 当前域名的图片，需要替换域名前缀
        if (this.isOurOwnPic(child.attrs)) {
          if (child.attrs.src.startsWith(STATIC_URL)) {
            newChild = this.view.state.schema.nodes.image.create({
              ...child.attrs,
              // width: child.attrs.width,
              src: child.attrs.src.replace(STATIC_URL, ""),
            })
          }
        } else if (child.attrs.src.substring(0, 4) === "/img") {
          // 拖拽图片，节点不变
        } else {
          // 非当前域名的图片，生成一个临时图片节点
          newChild = this.newUploadingImageNode(child.attrs)
          imageNodes.push({
            id: newChild.attrs.uploadId,
            url: child.attrs.src || child.attrs["data-src"],
          })
        }
      } else {
        // 应该是多个节点嵌套处理
        child.descendants((node, pos) => {
          if (node.type.name === "image") {
            if (this.isOurOwnPic(node.attrs)) {
              if (node.attrs.src.startsWith(STATIC_URL)) {
                const newChildNode = this.view.state.schema.nodes.image.create({
                  ...node.attrs,
                  // width: node.attrs.width,
                  src: node.attrs.src.replace(STATIC_URL, ""),
                })
                newChild = newChild.replace(
                  pos,
                  pos + 1,
                  new Slice(Fragment.from(newChildNode), 0, 0)
                )
              }
            } else if (node.attrs.src.substring(0, 4) === "/img") {
              // 拖拽图片，节点不变
            } else {
              const imageNode = this.newUploadingImageNode(node.attrs)
              newChild = newChild.replace(pos, pos + 1, new Slice(Fragment.from(imageNode), 0, 0))
              imageNodes.push({
                id: imageNode.attrs.uploadId,
                url: node.attrs.src || node.attrs["data-src"],
              })
            }
          }
        })
      }

      children.push(newChild)
    })

    imageNodes.forEach(({ url, id }) => this.uploadImageForId(url, id))

    return new Slice(Fragment.fromArray(children), slice.openStart, slice.openEnd)
  }

  // 截图
  public handlePaste(event: ClipboardEvent) {
    const items = Array.from(event.clipboardData?.items || [])

    /// Clipboard may contain both html and image items (like when pasting from ms word, excel)
    /// in that case (if there is any html), don't handle images.
    if (items.some((x) => x.type === "text/html")) {
      return false
    }

    const image = items.find((item) => this.config.acceptMimes.includes(item.type))

    if (image) {
      this.beforeUpload(image.getAsFile()!, this.view.state.selection.from)
      return true
    }

    return false
  }

  public beforeUpload(fileOrUrl: File | string, at: number) {
    const tr = this.view.state.tr
    if (!tr.selection.empty) {
      tr.deleteSelection()
    }

    if (at < 0) {
      at = this.view.state.selection.from
    }

    /// insert image node.
    const node = this.newUploadingImageNode({ src: fileOrUrl })
    tr.replaceWith(at, at, node)
    this.view.dispatch(tr)

    /// upload image for above node
    this.uploadImageForId(fileOrUrl, node.attrs.uploadId)
  }

  public newUploadingImageNode(attrs?: any): Node {
    // const empty_baseb4 = "data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'/%3E\n";
    const uploadId = this.config.id()
    fileCache[uploadId] = attrs.src || attrs["data-src"]
    return this.view.state.schema.nodes.imagePlaceholder.create({
      ...attrs,
      src: "", //attrs.src,
      uploadId,
    })
  }

  public async uploadImageForId(fileOrUrl: File | string, id: string) {
    const getImagePositions = () => {
      const positions: Array<{ node: Node; pos: number }> = []
      this.view.state.doc.descendants((node, pos) => {
        if (node.type.name === "imagePlaceholder" && node.attrs.uploadId === id) {
          positions.push({ node, pos })
        }
      })

      return positions
    }

    let file: string | File | null = fileOrUrl
    if (typeof file === "string") {
      file = await webImg2File(file)
    }

    const url =
      file &&
      ((await this.config
        .upload(file, id)
        // tslint:disable-next-line:no-console
        .catch(console.warn)) as string | undefined)

    const imageNodes = getImagePositions()
    if (!imageNodes.length) {
      return
    }

    /// disallow user from undoing back to 'uploading' state.
    // let tr = this.view.state.tr.setMeta('addToHistory', false);
    const tr = this.view.state.tr

    imageNodes.forEach(({ node, pos }) => {
      const newNode = this.view.state.schema.nodes.image.create({
        ...node.attrs,
        width: node.attrs.width,
        src: url || "",
      })
      tr.replaceWith(pos, pos + 1, newNode)
    })

    this.view.dispatch(tr)
    fileCache[id] = ""
  }

  public setView(view: EditorView): this {
    this.view = view
    return this
  }
  // 根据图片 src 和 ignoreDomains 配置，判断是否是当前域名的图片
  private isOurOwnPic(attrs: { src?: string; ["data-src"]?: string }): boolean {
    const src = attrs.src || attrs["data-src"] || ""
    return (this.config.ignoreDomains || []).some((domain) => src.includes(domain))
  }
}

function webImg2File(imgUrl: string): Promise<File | null> {
  function imgToBase64(url: string): Promise<string> {
    console.log("imgToBase64", url)
    let canvas: any = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.setAttribute("referrerpolicy", "no-referrer")
    img.src = url
    return new Promise((resolve, reject) => {
      img.onload = function () {
        canvas.height = img.height
        canvas.width = img.width
        ctx?.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL("image/png")
        resolve(dataURL)
        canvas = null
      }
      img.onerror = reject
    })
  }

  function base64toFile(base: string, filename: string): File {
    const arr = base.split(",")
    const res = arr[0].match(/:(.*?);/)
    const mime = res ? res[1] : ""
    const suffix = mime.split("/")[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    //转换成file对象
    return new File([u8arr], `${filename}.${suffix}`, { type: mime })
  }

  return imgToBase64(imgUrl)
    .then((base) => {
      return base64toFile(base, "网络图片")
    })
    .catch(() => {
      return null
    })
}

// export function getPluginInstances() {
//   return plugin
// }
export function getFileCache(key: string) {
  return fileCache[key]
}

// Base64 转换为文件
const base64toFile = (base: string, filename: string): File => {
  const arr = base.split(",")
  const res = arr[0].match(/:(.*?);/)
  const mime = res ? res[1] : ""
  const suffix = mime.split("/")[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  // 转换成file对象
  return new File([u8arr], `${filename}.${suffix}`, { type: mime })
}

// 文件转换为 Base64
const imgToBase64 = (url: string): Promise<string> => {
  let canvas: any = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  const img = new Image()
  img.crossOrigin = "Anonymous"
  img.setAttribute("referrerpolicy", "no-referrer")
  img.src = url
  return new Promise((resolve, reject) => {
    img.onload = function () {
      canvas.height = img.height
      canvas.width = img.width
      ctx?.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL("image/png")
      resolve(dataURL)
      canvas = null
    }
    img.onerror = reject
  })
}
