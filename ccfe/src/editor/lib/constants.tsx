export const embeds = {
  twitter: {
    regex: /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\?|\/|$)(\S+)?$/i,
  },
  youtube: {
    regex:
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|shorts\/|v\/)?)([\w-]+)(\S+)?$/i,
  },
  instagram: {
    regex: /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|reels)\/([^/?#&]+)(\S+)?$/i,
  },
  tiktok: {
    regex:
      /^(https?:\/\/)?(?:(?:www)\.(?:tiktok\.com)(?:\/)(?!foryou)(@[a-zA-Z0-9_.]+)(?:\/)(?:video)(?:\/)([\d]+)|(?:m)\.(?:tiktok\.com)(?:\/)(?!foryou)(?:v)(?:\/)?(?=([\d]+)\.html)|vm\.tiktok\.com(?:\/)([\S]+)(?:\/))(\S+)?$/i,
  },
  generic: {
    regex: /^(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/i,
  },
}

export enum EmbedService {
  YOUTUBE = "youtube",
  INSTAGRAM = "instagram",
  TWITTER = "twitter",
  FRAMER = "framer",
  FIGMA = "figma",
}

export const userNames = [
  "Lea Thompson",
  "Cyndi Lauper",
  "Tom Cruise",
  "Madonna",
  "Jerry Hall",
  "Joan Collins",
  "Winona Ryder",
  "Christina Applegate",
  "Alyssa Milano",
  "Molly Ringwald",
  "Ally Sheedy",
  "Debbie Harry",
  "Olivia Newton-John",
  "Elton John",
  "Michael J. Fox",
  "Axl Rose",
  "Emilio Estevez",
  "Ralph Macchio",
  "Rob Lowe",
  "Jennifer Grey",
  "Mickey Rourke",
  "John Cusack",
  "Matthew Broderick",
  "Justine Bateman",
  "Lisa Bonet",
]

export const userColors = [
  "#fb7185",
  "#fdba74",
  "#d9f99d",
  "#a7f3d0",
  "#a5f3fc",
  "#a5b4fc",
  "#f0abfc",
]

export const themeColors = ["#fb7185", "#fdba74", "#d9f99d", "#a7f3d0", "#a5f3fc", "#a5b4fc"]
