import * as vscode from 'vscode';
import { TextDocument, Range, CodeAction, CodeActionKind, WorkspaceEdit } from 'vscode';
import { markdownlint } from 'markdownlint';

interface MarkdownFix {
  line: number;
  fixInfo: {
    editColumn: number;
    deleteCount: number;
    insertText: string;
  };
  priority: number;
}

export class MarkdownQuickFixProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    CodeActionKind.QuickFix,
    CodeActionKind.SourceFixAll
  ];

  private fixes: Map<string, MarkdownFix[]> = new Map();

  async provideCodeActions(
    document: TextDocument,
    range: Range,
    context: vscode.CodeActionContext
  ): Promise<CodeAction[]> {
    const actions: CodeAction[] = [];
    const diagnostics = context.diagnostics;

    // Handle tab-triggered fixes
    if (this.isTabTriggered(context)) {
      const tabFix = this.createTabTriggeredFix(document, range);
      if (tabFix) actions.push(tabFix);
    }

    // Handle other diagnostics
    for (const diagnostic of diagnostics) {
      const fixes = await this.getFixesForDiagnostic(document, diagnostic);
      actions.push(...fixes);
    }

    // Add fix all action if there are multiple fixes
    if (actions.length > 1) {
      actions.push(this.createFixAllAction(document, actions));
    }

    return actions;
  }

  private isTabTriggered(context: vscode.CodeActionContext): boolean {
    return context.triggerKind === vscode.CodeActionTriggerKind.Invoke;
  }

  private async getFixesForDiagnostic(
    document: TextDocument,
    diagnostic: vscode.Diagnostic
  ): Promise<CodeAction[]> {
    const fixes = await this.calculateFixes(document, diagnostic.range);
    return fixes.map(fix => this.createFixAction(document, diagnostic, fix));
  }

  private async calculateFixes(document: TextDocument, range: Range): Promise<MarkdownFix[]> {
    const text = document.getText(range);
    const fixes: MarkdownFix[] = [];

    // Missing newlines
    if (!text.endsWith('\n')) {
      fixes.push({
        line: range.end.line,
        fixInfo: {
          editColumn: range.end.character,
          deleteCount: 0,
          insertText: '\n'
        },
        priority: 1
      });
    }

    // Indentation fixes
    const indentFix = this.calculateIndentationFix(text, range);
    if (indentFix) fixes.push(indentFix);

    // List marker standardization
    const listFix = this.standardizeListMarkers(text, range);
    if (listFix) fixes.push(listFix);

    return fixes;
  }

  private calculateIndentationFix(text: string, range: Range): MarkdownFix | null {
    const lines = text.split('\n');
    const firstLine = lines[0];
    const currentIndent = firstLine.match(/^\s*/)?.[0].length || 0;
    const expectedIndent = this.calculateExpectedIndent(text);

    if (currentIndent !== expectedIndent) {
      return {
        line: range.start.line,
        fixInfo: {
          editColumn: 0,
          deleteCount: currentIndent,
          insertText: ' '.repeat(expectedIndent)
        },
        priority: 2
      };
    }

    return null;
  }

  private calculateExpectedIndent(text: string): number {
    // Implement indentation calculation logic based on markdown rules
    // This is a simplified version
    if (text.match(/^[-*+]\s/)) return 2; // List items
    if (text.match(/^\d+\.\s/)) return 3; // Numbered lists
    if (text.match(/^>/)) return 2; // Blockquotes
    return 0; // Default
  }

  private standardizeListMarkers(text: string, range: Range): MarkdownFix | null {
    const listMatch = text.match(/^[-*+]\s/);
    if (listMatch) {
      return {
        line: range.start.line,
        fixInfo: {
          editColumn: 0,
          deleteCount: listMatch[0].length,
          insertText: '- ' // Standardize to hyphen
        },
        priority: 3
      };
    }
    return null;
  }

  private createFixAction(
    document: TextDocument,
    diagnostic: vscode.Diagnostic,
    fix: MarkdownFix
  ): CodeAction {
    const action = new CodeAction(
      `Fix: ${diagnostic.message}`,
      CodeActionKind.QuickFix
    );

    action.edit = new WorkspaceEdit();
    action.edit.replace(
      document.uri,
      new Range(
        fix.line, fix.fixInfo.editColumn,
        fix.line, fix.fixInfo.editColumn + fix.fixInfo.deleteCount
      ),
      fix.fixInfo.insertText
    );

    action.diagnostics = [diagnostic];
    action.isPreferred = fix.priority === 1;

    return action;
  }

  private createFixAllAction(
    document: TextDocument,
    individualFixes: CodeAction[]
  ): CodeAction {
    const fixAll = new CodeAction(
      'Fix all markdown issues',
      CodeActionKind.SourceFixAll
    );

    fixAll.edit = new WorkspaceEdit();
    for (const fix of individualFixes) {
      if (fix.edit) {
        fix.edit.entries().forEach(([uri, edits]) => {
          edits.forEach(edit => {
            fixAll.edit!.replace(uri, edit.range, edit.newText);
          });
        });
      }
    }

    return fixAll;
  }

  private createTabTriggeredFix(
    document: TextDocument,
    range: Range
  ): CodeAction | null {
    const text = document.getText(range);
    const fixes = this.fixes.get(document.uri.toString()) || [];
    
    if (fixes.length === 0) return null;

    const action = new CodeAction(
      'Quick fix (Tab)',
      CodeActionKind.QuickFix
    );

    action.edit = new WorkspaceEdit();
    fixes.forEach(fix => {
      action.edit!.replace(
        document.uri,
        new Range(
          fix.line, fix.fixInfo.editColumn,
          fix.line, fix.fixInfo.editColumn + fix.fixInfo.deleteCount
        ),
        fix.fixInfo.insertText
      );
    });

    return action;
  }
} 