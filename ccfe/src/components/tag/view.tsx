import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { App, Button, Empty, Popconfirm, Space, Table, Tag } from "antd"
import { type MyDatabase, type CardTag, EditTag } from "@/types"
import { CardContainer } from "@/components/ui"
import { useDBStore } from "@/store"
import type { GetDB } from "@/store"
import { EmptyBox } from "@/ui"
import { ColumnsType } from "antd/es/table"
import { TagEdit } from "./edit"

const dbSelector: GetDB = (state) => state.db

type Props = {
  spaceId: string
}
type TagItem = {
  idx: number
  key: string
  name: string
  color: string
  cardCnt?: number
}

let queryHandler: any = null
const tagStat = new Map<string, number>()
const statTags = async (db: MyDatabase, spaceId: string, tags: CardTag[]) => {
  const newTags: TagItem[] = []
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i]
    const cardCnt = tagStat.get(tag.id)
    if (cardCnt !== undefined) {
      newTags.push({ idx: i + 1, key: tag.id, name: tag.name, color: tag.color, cardCnt })
    } else {
      const cardCnt = await db.card.getTagCardCnt(spaceId, tag.id)
      tagStat.set(tag.id, cardCnt)
      newTags.push({ idx: i + 1, key: tag.id, name: tag.name, color: tag.color, cardCnt })
    }
  }
  return newTags
}

export const TagView = memo(({ spaceId }: Props) => {
  const db = useDBStore(dbSelector)
  const { message } = App.useApp()
  // 初始化节点标签
  const [tags, setTags] = useState<TagItem[]>()
  const [editTag, setEditTag] = useState<EditTag>()
  useEffect(() => {
    db?.tag.getTagQuery(spaceId).then((query) => {
      queryHandler = query.$.subscribe((docs) => {
        const ts = docs.map((doc) => doc.toJSON() as CardTag)
        statTags(db, spaceId, ts).then((newTags) => setTags(newTags))
      })
    })
    return () => queryHandler?.unsubscribe()
  }, [db, spaceId])
  const handleDelete = useCallback(
    (tagId: string) => {
      db?.tag.deleteTag(tagId).then(() => {
        message.success("标签删除成功！")
      })
    },
    [db?.tag, message]
  )
  const columns: ColumnsType<TagItem> = useMemo(
    () => [
      {
        title: "编号",
        dataIndex: "idx",
        key: "idx",
        align: "center",
      },
      {
        title: "标签",
        key: "tag",
        align: "center",
        render: (_, record) => <Tag color={record.color}>{record.name}</Tag>,
      },
      {
        title: "卡片数",
        dataIndex: "cardCnt",
        key: "cardCnt",
        align: "center",
      },
      {
        title: "操作",
        key: "action",
        align: "center",
        render: (_, record) => (
          <Space>
            <Popconfirm title="是否确认删除该标签？" onConfirm={() => handleDelete(record.key)}>
              <Button type="link">删除</Button>
            </Popconfirm>
            <Button
              onClick={() => setEditTag({ id: record.key, name: record.name, color: record.color })}
            >
              编辑
            </Button>
          </Space>
        ),
      },
    ],
    [handleDelete]
  )
  console.log("Render: TagView")
  return (
    <CardContainer>
      {tags &&
        (tags.length ? (
          <Table
            columns={columns}
            dataSource={tags}
            className="tagTable"
            bordered={true}
            pagination={false}
            size="small"
          />
        ) : (
          <EmptyBox image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无卡片标签" />
        ))}
      {editTag && <TagEdit editTag={editTag} setEditTag={setEditTag} />}
    </CardContainer>
  )
})
