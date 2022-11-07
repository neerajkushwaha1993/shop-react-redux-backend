export const schema = {
    type: "object",
    required: ["queryStringParameters"],
    properties: {
      queryStringParameters: {
        type: "object",
        required: ["name"],
        properties: {
          name: {
            type: "string",
            minLength: 1,
          },
        },
      },
    },
  };