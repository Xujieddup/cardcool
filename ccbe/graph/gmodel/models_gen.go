// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package gmodel

type Card struct {
	ID         string `json:"id"`
	SpaceID    string `json:"space_id"`
	TypeID     string `json:"type_id"`
	Name       string `json:"name"`
	Tags       string `json:"tags"`
	Links      string `json:"links"`
	Props      string `json:"props"`
	Content    string `json:"content"`
	CreateTime int    `json:"create_time"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type CardInput struct {
	ID         string `json:"id"`
	SpaceID    string `json:"space_id"`
	TypeID     string `json:"type_id"`
	Name       string `json:"name"`
	Tags       string `json:"tags"`
	Links      string `json:"links"`
	Props      string `json:"props"`
	Content    string `json:"content"`
	CreateTime int    `json:"create_time"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type CardInputPushRow struct {
	AssumedMasterState *CardInput `json:"assumedMasterState"`
	NewDocumentState   *CardInput `json:"newDocumentState"`
}

type CardPullBulk struct {
	Documents  []*Card     `json:"documents"`
	Checkpoint *Checkpoint `json:"checkpoint"`
}

type Checkpoint struct {
	UpdateTime int64 `json:"update_time"`
}

type InputCheckpoint struct {
	UpdateTime int64 `json:"update_time"`
}

type Space struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Icon       string `json:"icon"`
	Desc       string `json:"desc"`
	Snum       int    `json:"snum"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type SpaceInput struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Icon       string `json:"icon"`
	Desc       string `json:"desc"`
	Snum       int    `json:"snum"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type SpaceInputPushRow struct {
	AssumedMasterState *SpaceInput `json:"assumedMasterState"`
	NewDocumentState   *SpaceInput `json:"newDocumentState"`
}

type SpacePullBulk struct {
	Documents  []*Space    `json:"documents"`
	Checkpoint *Checkpoint `json:"checkpoint"`
}

type Tag struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	SpaceID    string `json:"space_id"`
	Pid        string `json:"pid"`
	Color      string `json:"color"`
	Snum       int    `json:"snum"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type TagInput struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	SpaceID    string `json:"space_id"`
	Pid        string `json:"pid"`
	Color      string `json:"color"`
	Snum       int    `json:"snum"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type TagInputPushRow struct {
	AssumedMasterState *TagInput `json:"assumedMasterState"`
	NewDocumentState   *TagInput `json:"newDocumentState"`
}

type TagPullBulk struct {
	Documents  []*Tag      `json:"documents"`
	Checkpoint *Checkpoint `json:"checkpoint"`
}

type Type struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Icon       string `json:"icon"`
	Snum       int    `json:"snum"`
	Props      string `json:"props"`
	Styles     string `json:"styles"`
	Desc       string `json:"desc"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type TypeInput struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Icon       string `json:"icon"`
	Snum       int    `json:"snum"`
	Props      string `json:"props"`
	Styles     string `json:"styles"`
	Desc       string `json:"desc"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type TypeInputPushRow struct {
	AssumedMasterState *TypeInput `json:"assumedMasterState"`
	NewDocumentState   *TypeInput `json:"newDocumentState"`
}

type TypePullBulk struct {
	Documents  []*Type     `json:"documents"`
	Checkpoint *Checkpoint `json:"checkpoint"`
}

type View struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	SpaceID    string `json:"space_id"`
	Pid        string `json:"pid"`
	Snum       int    `json:"snum"`
	Type       int    `json:"type"`
	InlineType int    `json:"inline_type"`
	IsFavor    bool   `json:"is_favor"`
	Icon       string `json:"icon"`
	Desc       string `json:"desc"`
	Config     string `json:"config"`
	Content    string `json:"content"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type ViewInput struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	SpaceID    string `json:"space_id"`
	Pid        string `json:"pid"`
	Snum       int    `json:"snum"`
	Type       int    `json:"type"`
	InlineType int    `json:"inline_type"`
	IsFavor    bool   `json:"is_favor"`
	Icon       string `json:"icon"`
	Desc       string `json:"desc"`
	Config     string `json:"config"`
	Content    string `json:"content"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type ViewInputPushRow struct {
	AssumedMasterState *ViewInput `json:"assumedMasterState"`
	NewDocumentState   *ViewInput `json:"newDocumentState"`
}

type ViewPullBulk struct {
	Documents  []*View     `json:"documents"`
	Checkpoint *Checkpoint `json:"checkpoint"`
}

type Viewedge struct {
	ID           string `json:"id"`
	ViewID       string `json:"view_id"`
	Source       string `json:"source"`
	Target       string `json:"target"`
	SourceHandle string `json:"source_handle"`
	TargetHandle string `json:"target_handle"`
	VeTypeID     string `json:"ve_type_id"`
	Name         string `json:"name"`
	Content      string `json:"content"`
	UpdateTime   int64  `json:"update_time"`
	IsDeleted    bool   `json:"is_deleted"`
	Deleted      bool   `json:"deleted"`
}

type ViewedgeInput struct {
	ID           string `json:"id"`
	ViewID       string `json:"view_id"`
	Source       string `json:"source"`
	Target       string `json:"target"`
	SourceHandle string `json:"source_handle"`
	TargetHandle string `json:"target_handle"`
	VeTypeID     string `json:"ve_type_id"`
	Name         string `json:"name"`
	Content      string `json:"content"`
	UpdateTime   int64  `json:"update_time"`
	IsDeleted    bool   `json:"is_deleted"`
	Deleted      bool   `json:"deleted"`
}

type ViewedgeInputPushRow struct {
	AssumedMasterState *ViewedgeInput `json:"assumedMasterState"`
	NewDocumentState   *ViewedgeInput `json:"newDocumentState"`
}

type ViewedgePullBulk struct {
	Documents  []*Viewedge `json:"documents"`
	Checkpoint *Checkpoint `json:"checkpoint"`
}

type Viewnode struct {
	ID         string `json:"id"`
	ViewID     string `json:"view_id"`
	GroupID    string `json:"group_id"`
	Pid        string `json:"pid"`
	NodeType   int    `json:"node_type"`
	NodeID     string `json:"node_id"`
	VnTypeID   string `json:"vn_type_id"`
	Name       string `json:"name"`
	Content    string `json:"content"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type ViewnodeInput struct {
	ID         string `json:"id"`
	ViewID     string `json:"view_id"`
	GroupID    string `json:"group_id"`
	Pid        string `json:"pid"`
	NodeType   int    `json:"node_type"`
	NodeID     string `json:"node_id"`
	VnTypeID   string `json:"vn_type_id"`
	Name       string `json:"name"`
	Content    string `json:"content"`
	UpdateTime int64  `json:"update_time"`
	IsDeleted  bool   `json:"is_deleted"`
	Deleted    bool   `json:"deleted"`
}

type ViewnodeInputPushRow struct {
	AssumedMasterState *ViewnodeInput `json:"assumedMasterState"`
	NewDocumentState   *ViewnodeInput `json:"newDocumentState"`
}

type ViewnodePullBulk struct {
	Documents  []*Viewnode `json:"documents"`
	Checkpoint *Checkpoint `json:"checkpoint"`
}
