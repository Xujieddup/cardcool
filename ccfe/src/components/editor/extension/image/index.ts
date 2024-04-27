// 1. Import the extension
import Image, { ImageOptions } from "@tiptap/extension-image"

type IImageOptions = ImageOptions & {
  domain: string
}

// 2. Overwrite the keyboard shortcuts
export const IImage = Image.extend<IImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      domain: "",
    }
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        // Customize the HTML parsing (for example, to load the initial content)
        // parseHTML: (element) => {
        //   console.log("element", element)
        //   const srcValue = element.getAttribute("src")
        //   if (srcValue?.startsWith(this.options.domain)) {
        //     return srcValue.replace(this.options.domain, "")
        //   }
        //   return srcValue
        // },
        // … and customize the HTML rendering.
        renderHTML: (attributes) => {
          const matchUrl = attributes.src && attributes.src.substring(0, 4) === "/img"
          return {
            src: matchUrl ? this.options.domain + attributes.src : attributes.src,
          }
        },
      },
    }
  },
})
