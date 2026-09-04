import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../delivery-backend/docs/schema.graphql',
  documents: ['./src/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    './src/graphql/types.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          DateTime: 'string',
        },
        enumsAsTypes: true,
      },
    },
    './src/graphql/operations.ts': {
      plugins: ['typescript-operations', 'typescript-react-apollo'],
      config: {
        scalars: {
          DateTime: 'string',
        },
        enumsAsTypes: true,
        importSchemaTypesFrom: './src/graphql/types',
        namespacedImportName: 'Types',
        withHooks: true,
        withComponent: false,
        withHOC: false,
        apolloReactCommonImportFrom: '@apollo/client',
        apolloReactHooksImportFrom: '@apollo/client',
      },
    },
  },
};

export default config;
