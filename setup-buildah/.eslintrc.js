module.exports = {
    root: true,
    extends: [
        "@redhat-actions/eslint-config",
    ],
    parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: __dirname,
    },
    overrides: [
        {
            files: [ "**/*.test.ts" ],
            rules: {
                "import/no-extraneous-dependencies": [ "error", { devDependencies: true } ],
            },
        },
    ],
};
