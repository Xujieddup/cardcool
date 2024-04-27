import { spaceScheme, spaceCollectionMethods } from "./space"
import { typeScheme, typeCollectionMethods } from "./type"
import { cardScheme, cardCollectionMethods } from "./card"
import { tagScheme, tagCollectionMethods } from "./tag"
import { viewScheme, viewCollectionMethods } from "./view"
import { viewNodeScheme, viewNodeCollectionMethods } from "./viewnode"
import { viewEdgeScheme, viewEdgeCollectionMethods } from "./viewedge"
import { GraphQLSchemaFromRxSchemaInput } from "rxdb/dist/types/plugins/replication-graphql"
import { RxConflictHandler, RxConflictHandlerInput, RxConflictHandlerOutput, deepEqual } from "rxdb"

const cardConflictHandler: RxConflictHandler<any> = (
  i: RxConflictHandlerInput<any>
): Promise<RxConflictHandlerOutput<any>> => {
  const realMasterState =
    typeof i.realMasterState.tags === "string"
      ? {
          ...i.realMasterState,
          tags: JSON.parse(i.realMasterState.tags) || [],
          links: JSON.parse(i.realMasterState.links) || [],
        }
      : i.realMasterState
  // console.log("conflict", i, realMasterState, deepEqual(i.newDocumentState, realMasterState))
  if (deepEqual(i.newDocumentState, realMasterState)) {
    return Promise.resolve({ isEqual: true })
  }
  return Promise.resolve({ isEqual: false, documentData: realMasterState })
}

export const collections = {
  space: {
    schema: spaceScheme,
    statics: spaceCollectionMethods,
  },
  type: {
    schema: typeScheme,
    statics: typeCollectionMethods,
  },
  card: {
    schema: cardScheme,
    statics: cardCollectionMethods,
    conflictHandler: cardConflictHandler,
  },
  tag: {
    schema: tagScheme,
    statics: tagCollectionMethods,
  },
  view: {
    schema: viewScheme,
    statics: viewCollectionMethods,
  },
  viewnode: {
    schema: viewNodeScheme,
    statics: viewNodeCollectionMethods,
  },
  viewedge: {
    schema: viewEdgeScheme,
    statics: viewEdgeCollectionMethods,
  },
}

export const getGraphQLInputs = () => {
  const graphQLInputs: GraphQLSchemaFromRxSchemaInput = {}
  Object.entries(collections).forEach(([k, v]) => {
    graphQLInputs[k] = {
      schema: v.schema,
      checkpointFields: ["update_time"],
      deletedField: "deleted",
    }
  })
  return graphQLInputs
}

// export const getGraphQLInputs = () : GraphQLSchemaFromRxSchemaInput => {
//   return {
//     node: {
//       schema: nodeScheme,
//       checkpointFields: [ "update_time" ],
//       deletedField: "deleted",
//     }
//   }
// }
