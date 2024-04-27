import { RxGraphQLReplicationPullQueryBuilder } from "rxdb";
import { fillUpOptionals, graphQLSchemaFromRxSchema, GraphQLSchemaFromRxSchemaInput, SPACING } from 'rxdb/plugins/replication-graphql';
import { GraphQLSchemaFromRxSchemaInputSingleCollection, Prefixes } from "rxdb/dist/types/plugins/replication-graphql";

function ucfirst(str: string) {
  str += '';
  const f = str.charAt(0).toUpperCase();
  return f + str.substring(1);
}

export function pullQueryBuilderFromRxSchema2(
  collectionName: string,
  input: GraphQLSchemaFromRxSchemaInputSingleCollection,
): RxGraphQLReplicationPullQueryBuilder<any> {
  input = fillUpOptionals(input);
  const schema = input.schema;
  const prefixes: Prefixes = input.prefixes as any;

  const ucCollectionName = ucfirst(collectionName);
  const queryName = prefixes.pull + ucCollectionName;

  const outputFields = Object.keys(schema.properties).filter(k => !(input.ignoreOutputKeys as string[]).includes(k));
  // outputFields.push(input.deletedField);

  // const checkpointInputName = ucCollectionName + 'Input' + prefixes.checkpoint;
  const checkpointInputName = 'Input' + prefixes.checkpoint;

  const builder: RxGraphQLReplicationPullQueryBuilder<any> = (checkpoint: any, limit: number) => {
    const query = 'query ' + ucfirst(queryName) + '($checkpoint: ' + checkpointInputName + ', $limit: Int!) {\n' +
      SPACING + SPACING + queryName + '(checkpoint: $checkpoint, limit: $limit) {\n' +
      SPACING + SPACING + SPACING + 'documents {\n' +
      SPACING + SPACING + SPACING + SPACING + outputFields.join('\n' + SPACING + SPACING + SPACING + SPACING) + '\n' +
      SPACING + SPACING + SPACING + '}\n' +
      SPACING + SPACING + SPACING + 'checkpoint {\n' +
      SPACING + SPACING + SPACING + SPACING + input.checkpointFields.join('\n' + SPACING + SPACING + SPACING + SPACING) + '\n' +
      SPACING + SPACING + SPACING + '}\n' +
      SPACING + SPACING + '}\n' +
      '}';
    return {
      query,
      variables: {
        checkpoint,
        limit
      }
    };
  };

  return builder;
}

// 生成 GraphQL Schema
export const genGraphQL = (graphQLInputs: GraphQLSchemaFromRxSchemaInput) => {
  let { asString: graph } = graphQLSchemaFromRxSchema(graphQLInputs);
  graph = graph
    .replace(/type Subscription {\n(.*!\n)+}\n\n/gi, "")  // Subscription
    .replace(/input SpaceInputCheckpoint/gi, "input InputCheckpoint")
    .replace(/subscription: Subscription\n/gi, "")
    .replace(/ (\w+)InputCheckpoint, limit/gi, " InputCheckpoint, limit") // InputCheckpoint
    .replace(/input (\w+)InputCheckpoint {\n(.*!\n)+}\n/gi, "")
    .replace(/type SpaceCheckpoint/gi, "type Checkpoint") // Checkpoint
    .replace(/type (\w+)Checkpoint {\n(.*!\n)+}\n/gi, "")
    .replace(/type (\w+)CheckpointT0 {\n(.*!\n)+}\n/gi, "")
    .replace(/(\w+)PullBulkT0CheckpointT0/gi, "Checkpoint")
    .replace(/TypeT0PropsT0T0/gi, "TypeProps")    // type props
    .replace(/type TypePullBulkT0DocumentsT0T0PropsT0T0 {\n( .*\n)+}\n/gi, "")
    .replace(/TypePullBulkT0DocumentsT0T0PropsT0T0/gi, "TypeProps")
    .replace(/TypeInputT0PropsT0T0/gi, "TypeInputProps")    // input type props
    .replace(/input TypeInputPushRowT0AssumedMasterStateT0PropsT0T0 {\n( .*\n)+}\n/gi, "")
    .replace(/input TypeInputPushRowT0NewDocumentStateT0PropsT0T0 {\n( .*\n)+}\n/gi, "")
    .replace(/TypeInputPushRowT0AssumedMasterStateT0PropsT0T0/gi, "TypeInputProps")
    .replace(/TypeInputPushRowT0NewDocumentStateT0PropsT0T0/gi, "TypeInputProps")
    .replace(/type (\w+)PullBulkT0DocumentsT0T0 {\n( .*\n)+}\n/gi, "")  // PullBulkT0DocumentsT0T0
    .replace(/PullBulkT0DocumentsT0T0/gi, "")
    // input SpaceInputPushRowT0AssumedMasterStateT0
    .replace(/input (\w+)InputPushRowT0AssumedMasterStateT0 {\n( .*\n)+}\n/gi, "")
    .replace(/PushRowT0AssumedMasterStateT0/gi, "")
    // input SpaceInputPushRowT0NewDocumentStateT0
    .replace(/input (\w+)InputPushRowT0NewDocumentStateT0 {\n( .*\n)+}\n/gi, "")
    .replace(/PushRowT0NewDocumentStateT0/gi, "")
    // Int - Float
    .replace(/Float/gi, "Int")
    .replace(/update_time: Int/gi, "update_time: Float")
    .replace(/ {2}}/gi, "}")
  console.log(graph);
};