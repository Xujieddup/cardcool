package api

import (
	"cc/be/graph"
	"cc/be/graph/generated"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
)

type GraphQLApi struct{}

func NewGraphQLApi() *GraphQLApi {
	return &GraphQLApi{}
}

// Defining the Graphql handler
func (gql *GraphQLApi) GraphQLHandler() gin.HandlerFunc {
	// NewExecutableSchema and Config are in the generated.go file
	// Resolver is in the resolver.go file
	h := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
	// WebSocket
	// h.AddTransport(&transport.Websocket{}) // <---- This is the important part!
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

// Defining the Playground handler
func (gql *GraphQLApi) PlaygroundHandler() gin.HandlerFunc {
	h := playground.Handler("GraphQL", "/graph/query")
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}
