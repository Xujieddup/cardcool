import type { MenuGroup } from "@/types"

export const menuGroups: MenuGroup[] = [
  {
    name: "base",
    title: "基础",
    commands: [
      {
        name: "text",
        label: "文本",
        icon: "Type",
        aliases: ["text", "txt", "wb"],
        action: (editor) => {
          editor.chain().focus().setParagraph().run()
        },
      },
      {
        name: "h1",
        label: "一级标题",
        icon: "Heading1",
        aliases: ["h1", "yj"],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 1 }).run()
        },
      },
      {
        name: "h2",
        label: "二级标题",
        icon: "Heading2",
        aliases: ["h2", "ej"],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 2 }).run()
        },
      },
      {
        name: "h3",
        label: "三级标题",
        icon: "Heading3",
        aliases: ["h3", "sj"],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 3 }).run()
        },
      },
      {
        name: "h4",
        label: "四级标题",
        icon: "Heading4",
        aliases: ["h4", "sj"],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 4 }).run()
        },
      },
      {
        name: "h5",
        label: "五级标题",
        icon: "Heading5",
        aliases: ["h5", "wj"],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 5 }).run()
        },
      },
      {
        name: "h6",
        label: "六级标题",
        icon: "Heading6",
        aliases: ["h6", "lj"],
        action: (editor) => {
          editor.chain().focus().setHeading({ level: 6 }).run()
        },
      },
      {
        name: "numberedList",
        label: "有序列表",
        icon: "ListOrdered",
        aliases: ["ol", "yx"],
        action: (editor) => {
          editor.chain().focus().toggleOrderedList().run()
        },
      },
      {
        name: "bulletList",
        label: "无序列表",
        icon: "List",
        aliases: ["ul", "wx"],
        action: (editor) => {
          editor.chain().focus().toggleBulletList().run()
        },
      },
      {
        name: "taskList",
        label: "任务列表",
        icon: "ListTodo",
        aliases: ["todo", "rw"],
        action: (editor) => {
          editor.chain().focus().toggleTaskList().run()
        },
      },
      {
        name: "codeBlock",
        label: "代码块",
        icon: "SquareCode",
        aliases: ["code", "dm"],
        shouldBeHidden: (editor) => editor.isActive("columns"),
        action: (editor) => {
          editor.chain().focus().setCodeBlock().run()
        },
      },
      {
        name: "blockquote",
        label: "引用",
        icon: "Quote",
        aliases: ["quote", "yy"],
        action: (editor) => {
          editor.chain().focus().setBlockquote().run()
        },
      },
      {
        name: "horizontalRule",
        label: "水平线",
        icon: "Minus",
        aliases: ["hr", "line", "xian"],
        action: (editor) => {
          editor.chain().focus().setHorizontalRule().run()
        },
      },
    ],
  },
  // {
  //   name: "insert",
  //   title: "嵌入",
  //   commands: [
  //     // {
  //     //   name: "table",
  //     //   label: "Table",
  //     //   icon: "Table",

  //     //   shouldBeHidden: (editor) => editor.isActive("columns"),
  //     //   action: (editor) => {
  //     //     editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run()
  //     //   },
  //     // },
  //     // {
  //     //   name: "image",
  //     //   label: "Image",
  //     //   icon: "Image",

  //     //   aliases: ["img"],
  //     //   action: (editor) => {
  //     //     editor.chain().focus().setImageUpload().run()
  //     //   },
  //     // },
  //     {
  //       name: "columns",
  //       label: "分栏",
  //       icon: "Columns",
  //       aliases: ["cols"],
  //       shouldBeHidden: (editor) => editor.isActive("columns"),
  //       action: (editor) => {
  //         editor
  //           .chain()
  //           .focus()
  //           .setColumns()
  //           .focus(editor.state.selection.head - 1)
  //           .run()
  //       },
  //     },
  //     // {
  //     //   name: "toc",
  //     //   label: "Table of Contents",
  //     //   icon: "Book",
  //     //   aliases: ["outline"],

  //     //   shouldBeHidden: (editor) => editor.isActive("columns"),
  //     //   action: (editor) => {
  //     //     editor.chain().focus().insertTableOfContent().run()
  //     //   },
  //     // },
  //   ],
  // },
]

// export default GROUPS
