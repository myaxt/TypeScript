/* @internal */
namespace ts.codefix {
    const groupId = "constructorForDerivedNeedSuperCall";
    const errorCodes = [Diagnostics.Constructors_for_derived_classes_must_contain_a_super_call.code];
    registerCodeFix({
        errorCodes,
        getCodeActions: (context: CodeFixContext) => {
            const { sourceFile } = context;
            const ctr = getNode(sourceFile, context.span.start);
            const changes = textChanges.ChangeTracker.with(context, t => doChange(t, sourceFile, ctr, context.newLineCharacter));
            return [{ description: getLocaleSpecificMessage(Diagnostics.Add_missing_super_call), changes, groupId }];
        },
        groupIds: [groupId],
        fixAllInGroup: context => {
            const { newLineCharacter, sourceFile } = context;
            return iterateErrorsForCodeActionAll(context, errorCodes, (changes, e) => {
                doChange(changes, sourceFile, getNode(e.file, e.start!), newLineCharacter)
            });
        },
    });

    function getNode(sourceFile: SourceFile, pos: number): ConstructorDeclaration {
        const token = getTokenAtPosition(sourceFile, pos, /*includeJsDocComment*/ false);
        Debug.assert(token.kind === SyntaxKind.ConstructorKeyword);
        return token.parent as ConstructorDeclaration;
    }

    function doChange(changes: textChanges.ChangeTracker, sourceFile: SourceFile, ctr: ConstructorDeclaration, newLineCharacter: string) {
        const superCall = createStatement(createCall(createSuper(), /*typeArguments*/ undefined, /*argumentsArray*/ emptyArray));
        changes.insertNodeAfter(sourceFile, getOpenBrace(ctr, sourceFile), superCall, { suffix: newLineCharacter });
    }
}
