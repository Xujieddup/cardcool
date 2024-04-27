// import { Icon } from "@/components/ui/Icon"
// import { Toolbar } from "@/components/ui/Toolbar"
import { Editor } from "@tiptap/react"
import React, { memo, useState } from "react"
import { IBubbleMenu } from "../IBubbleMenu"
import { Dropdown, MenuProps, Space, Typography } from "antd"
import { IFlexRB, IconBtn } from "@/ui"
import { IIcon, NIcon } from "@/icons"
import { useTextMenuState } from "../hooks/useTextMenuState"
import { useTextMenuCommand } from "../hooks/useTextMenuCommand"
import cc from "classcat"
import { XYPos } from "@/types"
// import * as Popover from "@radix-ui/react-popover"
// import { Surface } from "@/components/ui/Surface"
// import { ColorPicker } from "@/components/panels"
// import { FontFamilyPicker } from "./components/FontFamilyPicker"
// import { FontSizePicker } from "./components/FontSizePicker"
// import { useTextmenuContentTypes } from "./hooks/useTextmenuContentTypes"
// import { ContentTypePicker } from "./components/ContentTypePicker"
// import { AIDropdown } from "./components/AIDropdown"
// import { EditLinkPopover } from "./components/EditLinkPopover"

// We memorize the button so each button is not rerendered
// on every editor state change
// const MemoButton = memo(Toolbar.Button)
// const MemoColorPicker = memo(ColorPicker)
// const MemoFontFamilyPicker = memo(FontFamilyPicker)
// const MemoFontSizePicker = memo(FontSizePicker)
// const MemoContentTypePicker = memo(ContentTypePicker)

export type TextMenuProps = {
  editor: Editor
}
const moreItems: MenuProps["items"] = [
  {
    key: "delete",
    label: (
      <IFlexRB>
        <Typography.Text>删除</Typography.Text>
        <Typography.Text type="secondary">Delete</Typography.Text>
      </IFlexRB>
    ),
  },
]

export const TextMenu = memo(({ editor }: TextMenuProps) => {
  const commands = useTextMenuCommand(editor)
  // 选中文本的状态，需要手动触发更新
  const states = useTextMenuState(editor)
  // 选中文本的中间坐标
  const [pos, setPos] = useState<XYPos>()
  // const blockOptions = useTextmenuContentTypes(editor)
  // console.log("Render: TextMenu", states)
  return (
    <IBubbleMenu
      pluginKey="textMenu"
      editor={editor}
      shouldShow={states.shouldShow}
      pos={pos}
      setPos={setPos}
    >
      <Space size={4} className="textMenu">
        <IconBtn
          onClick={commands.onBold}
          className={cc({ activeBtn: states.isBold })}
          icon={<NIcon icon="Bold" />}
          type="text"
          size="small"
        />
        <IconBtn
          onClick={commands.onItalic}
          className={cc({ activeBtn: states.isItalic })}
          icon={<NIcon icon="Italic" />}
          type="text"
          size="small"
        />
        <IconBtn
          onClick={commands.onUnderline}
          className={cc({ activeBtn: states.isUnderline })}
          icon={<NIcon icon="Underline" />}
          type="text"
          size="small"
        />
        <IconBtn
          onClick={commands.onStrike}
          className={cc({ activeBtn: states.isStrike })}
          icon={<NIcon icon="Strikethrough" />}
          type="text"
          size="small"
        />
        <IconBtn
          onClick={commands.onCode}
          className={cc({ activeBtn: states.isCode })}
          icon={<NIcon icon="Code" />}
          type="text"
          size="small"
        />
        {/* {aGroupNode && <Align nodeId={id} layout={layout} />} */}
        {/* <Dropdown
          menu={{
            items: moreItems,
            // onClick: handleMore
          }}
          placement="bottomRight"
          trigger={["click"]}
          overlayClassName="idropdown"
          overlayStyle={{ width: 160 }}
          align={{ targetOffset: [-6, -6] }}
        >
          <IconBtn icon={<IIcon icon="more" />} type="text" size="small" />
        </Dropdown> */}
      </Space>
      {/* <Toolbar.Wrapper>
          <AIDropdown
            onCompleteSentence={commands.onCompleteSentence}
            onEmojify={commands.onEmojify}
            onFixSpelling={commands.onFixSpelling}
            onMakeLonger={commands.onMakeLonger}
            onMakeShorter={commands.onMakeShorter}
            onSimplify={commands.onSimplify}
            onTldr={commands.onTldr}
            onTone={commands.onTone}
            onTranslate={commands.onTranslate}
          />
          <Toolbar.Divider />
          <MemoContentTypePicker options={blockOptions} />
          <MemoFontFamilyPicker onChange={commands.onSetFont} value={states.currentFont || ""} />
          <MemoFontSizePicker onChange={commands.onSetFontSize} value={states.currentSize || ""} />
          <Toolbar.Divider />
          <MemoButton
            tooltip="Bold"
            tooltipShortcut={["Mod", "B"]}
            onClick={commands.onBold}
            active={states.isBold}
          >
            <Icon name="Bold" />
          </MemoButton>
          <MemoButton
            tooltip="Italic"
            tooltipShortcut={["Mod", "I"]}
            onClick={commands.onItalic}
            active={states.isItalic}
          >
            <Icon name="Italic" />
          </MemoButton>
          <MemoButton
            tooltip="Underline"
            tooltipShortcut={["Mod", "U"]}
            onClick={commands.onUnderline}
            active={states.isUnderline}
          >
            <Icon name="Underline" />
          </MemoButton>
          <MemoButton
            tooltip="Strikehrough"
            tooltipShortcut={["Mod", "X"]}
            onClick={commands.onStrike}
            active={states.isStrike}
          >
            <Icon name="Strikethrough" />
          </MemoButton>
          <MemoButton
            tooltip="Code"
            tooltipShortcut={["Mod", "E"]}
            onClick={commands.onCode}
            active={states.isCode}
          >
            <Icon name="Code" />
          </MemoButton>
          <MemoButton tooltip="Code block" onClick={commands.onCodeBlock}>
            <Icon name="Code2" />
          </MemoButton>
          <EditLinkPopover onSetLink={commands.onLink} />
          <Popover.Root>
            <Popover.Trigger asChild>
              <MemoButton active={!!states.currentHighlight} tooltip="Highlight text">
                <Icon name="Highlighter" />
              </MemoButton>
            </Popover.Trigger>
            <Popover.Content side="top" sideOffset={8} asChild>
              <Surface className="p-1">
                <MemoColorPicker
                  color={states.currentHighlight}
                  onChange={commands.onChangeHighlight}
                  onClear={commands.onClearHighlight}
                />
              </Surface>
            </Popover.Content>
          </Popover.Root>
          <Popover.Root>
            <Popover.Trigger asChild>
              <MemoButton active={!!states.currentColor} tooltip="Text color">
                <Icon name="Palette" />
              </MemoButton>
            </Popover.Trigger>
            <Popover.Content side="top" sideOffset={8} asChild>
              <Surface className="p-1">
                <MemoColorPicker
                  color={states.currentColor}
                  onChange={commands.onChangeColor}
                  onClear={commands.onClearColor}
                />
              </Surface>
            </Popover.Content>
          </Popover.Root>
          <Popover.Root>
            <Popover.Trigger asChild>
              <MemoButton tooltip="More options">
                <Icon name="MoreVertical" />
              </MemoButton>
            </Popover.Trigger>
            <Popover.Content side="top" asChild>
              <Toolbar.Wrapper>
                <MemoButton
                  tooltip="Subscript"
                  tooltipShortcut={["Mod", "."]}
                  onClick={commands.onSubscript}
                  active={states.isSubscript}
                >
                  <Icon name="Subscript" />
                </MemoButton>
                <MemoButton
                  tooltip="Superscript"
                  tooltipShortcut={["Mod", ","]}
                  onClick={commands.onSuperscript}
                  active={states.isSuperscript}
                >
                  <Icon name="Superscript" />
                </MemoButton>
                <Toolbar.Divider />
                <MemoButton
                  tooltip="Align left"
                  tooltipShortcut={["Shift", "Mod", "L"]}
                  onClick={commands.onAlignLeft}
                  active={states.isAlignLeft}
                >
                  <Icon name="AlignLeft" />
                </MemoButton>
                <MemoButton
                  tooltip="Align center"
                  tooltipShortcut={["Shift", "Mod", "E"]}
                  onClick={commands.onAlignCenter}
                  active={states.isAlignCenter}
                >
                  <Icon name="AlignCenter" />
                </MemoButton>
                <MemoButton
                  tooltip="Align right"
                  tooltipShortcut={["Shift", "Mod", "R"]}
                  onClick={commands.onAlignRight}
                  active={states.isAlignRight}
                >
                  <Icon name="AlignRight" />
                </MemoButton>
                <MemoButton
                  tooltip="Justify"
                  tooltipShortcut={["Shift", "Mod", "J"]}
                  onClick={commands.onAlignJustify}
                  active={states.isAlignJustify}
                >
                  <Icon name="AlignJustify" />
                </MemoButton>
              </Toolbar.Wrapper>
            </Popover.Content>
          </Popover.Root>
        </Toolbar.Wrapper> */}
    </IBubbleMenu>
  )
})
