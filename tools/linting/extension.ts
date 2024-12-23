import * as vscode from 'vscode';
import { MarkdownQuickFixProvider } from './markdown-quick-fix';

export function activate(context: vscode.ExtensionContext) {
    // Register the quick fix provider
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('markdown', new MarkdownQuickFixProvider(), {
            providedCodeActionKinds: MarkdownQuickFixProvider.providedCodeActionKinds
        })
    );

    // Register the tab-trigger command
    context.subscriptions.push(
        vscode.commands.registerCommand('markdownlint.triggerQuickFix', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'markdown') {
                return;
            }

            const position = editor.selection.active;
            const range = editor.document.getWordRangeAtPosition(position) || 
                         new vscode.Range(position, position);

            const actions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
                'vscode.executeCodeActionProvider',
                editor.document.uri,
                range,
                vscode.CodeActionKind.QuickFix.value
            );

            if (actions && actions.length > 0) {
                const preferredAction = actions.find(action => action.isPreferred) || actions[0];
                if (preferredAction.edit) {
                    await vscode.workspace.applyEdit(preferredAction.edit);
                } else if (preferredAction.command) {
                    await vscode.commands.executeCommand(preferredAction.command.command, 
                                                      ...(preferredAction.command.arguments || []));
                }
            }
        })
    );

    // Register keybinding for tab-trigger
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('markdownlint.fixOnTab', async (editor) => {
            if (editor.document.languageId !== 'markdown') {
                return;
            }

            const position = editor.selection.active;
            await vscode.commands.executeCommand('markdownlint.triggerQuickFix');

            // Move cursor to next position if no fixes were applied
            const newPosition = new vscode.Position(position.line, position.character + 1);
            editor.selection = new vscode.Selection(newPosition, newPosition);
        })
    );
}

export function deactivate() {
    // Cleanup if needed
} 