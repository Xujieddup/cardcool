import { Extension } from "@tiptap/core"
import { IBubbleMenuPlugin, IBubbleMenuPluginProps } from "./IBubbleMenuPlugin"

export type IBubbleMenuOptions = Omit<IBubbleMenuPluginProps, "editor" | "element"> & {
  element: HTMLElement | null
}

export const IBubbleMenu = Extension.create<IBubbleMenuOptions>({
  name: "ibubbleMenu",

  // addOptions() {
  //   return {
  //     element: null,
  //     tippyOptions: {},
  //     pluginKey: "bubbleMenu",
  //     updateDelay: undefined,
  //     shouldShow: null,
  //   }
  // },

  // addProseMirrorPlugins() {
  //   if (!this.options.element) {
  //     return []
  //   }

  //   return [
  //     IBubbleMenuPlugin({
  //       pluginKey: this.options.pluginKey,
  //       editor: this.editor,
  //       element: this.options.element,
  //       tippyOptions: this.options.tippyOptions,
  //       updateDelay: this.options.updateDelay,
  //       shouldShow: this.options.shouldShow,
  //     }),
  //   ]
  // },
})
