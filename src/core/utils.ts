import {
  Symbol,
  Node,
  JSDoc,
  TypeGuards,
  SyntaxKind,
  SourceFile,
  ClassDeclaration,
  VariableStatement,
  TypeAliasDeclaration,
  InterfaceDeclaration,
} from 'ts-morph'

import { Maybe } from './utility-types'

export const getComponentName = (
  sourceFile: SourceFile,
  node: ClassDeclaration | VariableStatement,
): Maybe<string> => {
  if (TypeGuards.isClassDeclaration(node)) {
    // TODO: Get name from from static displayName.
    // Class may be exports as anonymous.
    return node.getName()
  }
  if (TypeGuards.isVariableStatement(node)) {
    const componentName = node.getDeclarations()[0].getName()
    // try get name from static displayName.
    const expressionStatement = sourceFile.getStatementByKind(SyntaxKind.ExpressionStatement)
    if (expressionStatement === undefined) {
      return componentName
    }
    const expression = expressionStatement.getExpression()
    // Fn.displayName = 'content'
    if (!TypeGuards.isBinaryExpression(expression)) {
      return componentName
    }
    // Fn.displayName
    const left = expression.getLeft()
    // 'content'
    const right = expression.getRight()
    if (!TypeGuards.isPropertyAccessExpression(left)) {
      return componentName
    }
    if (left.getName() !== 'displayName') {
      return componentName
    }
    const leftExpression = left.getExpression()
    if (!TypeGuards.isIdentifier(leftExpression)) {
      return componentName
    }
    if (leftExpression.getText() !== componentName) {
      return componentName
    }
    if (TypeGuards.isStringLiteral(right)) {
      return right.getText()
    }
    // TODO: Get name from function.
    return componentName
  }
  return undefined
}

export const getTypeNodeFromSource = (
  sourceFile: SourceFile,
  interfaceOrTypeName: string,
): Maybe<InterfaceDeclaration | TypeAliasDeclaration> => {
  const interfaceNode = sourceFile.getInterface(interfaceOrTypeName)
  const typeNode = sourceFile.getTypeAlias(interfaceOrTypeName)
  return interfaceNode || typeNode
}

export const getDeclaration = (symbol: Symbol): Node => {
  const declarations = symbol.getDeclarations()
  return declarations[0]
}

export const getJsDocFromNode = (node: Node): Maybe<JSDoc> => {
  if (TypeGuards.isJSDocableNode(node)) {
    const jsDocs = node.getJsDocs()
    return jsDocs[jsDocs.length - 1]
  }
  return undefined
}

export function getJsDocFromSymbol(symbol: Symbol): Maybe<JSDoc> {
  const node = getDeclaration(symbol)
  return getJsDocFromNode(node)
}

export const getDescriptionFromNode = (node: Node): Maybe<string> => {
  const jsDocs = getJsDocFromNode(node)
  if (!jsDocs) {
    return undefined
  }
  return jsDocs.getComment()
}

export const isReactSource = (symbol: Symbol): boolean => {
  return (
    getDeclaration(symbol)
      .getSourceFile()
      .getFilePath()
      .match(/@types\/react/) !== null
  )
}

export const isInternalOrPrivate = (symbol: Symbol): boolean => {
  const jsDoc = getJsDocFromSymbol(symbol)
  const excludedTags = ['internal', 'private']
  if (!jsDoc) {
    return false
  }
  for (const tag of jsDoc.getTags()) {
    if (excludedTags.includes(tag.getTagName())) {
      return true
    }
  }
  return false
}

export const getPropsFromTypeNode = (node: Node): Symbol[] => {
  return node
    .getType()
    .getProperties()
    .filter((symbol) => !isReactSource(symbol))
    .filter((symbol) => !isInternalOrPrivate(symbol))
}

export const getPropName = (symbol: Symbol): string => {
  return symbol.getEscapedName()
}

export const getPropDescription = (symbol: Symbol): Maybe<string> => {
  const jsDoc = getJsDocFromSymbol(symbol)
  if (!jsDoc) {
    return undefined
  }
  return jsDoc.getComment()
}

export const isOptionalProp = (symbol: Symbol): boolean => {
  const declaration = getDeclaration(symbol)
  if (TypeGuards.isQuestionTokenableNode(declaration)) {
    return declaration.hasQuestionToken()
  }
  return false
}

export const getPropDefaultValue = (symbol: Symbol): Maybe<string> => {
  const jsDoc = getJsDocFromSymbol(symbol)
  const defaultValueTags = ['default', 'defaultValue']
  if (!jsDoc) {
    return undefined
  }
  for (const tag of jsDoc.getTags()) {
    if (defaultValueTags.includes(tag.getTagName())) {
      return tag.getComment()
    }
  }
  return undefined
}

export type PropType = {
  name: string
  description?: string
  optional: boolean
  defaultValue?: string
}

export const createPropType = (symbol: Symbol): PropType => {
  return {
    name: getPropName(symbol),
    description: getPropDescription(symbol),
    optional: isOptionalProp(symbol),
    defaultValue: getPropDefaultValue(symbol),
  }
}

export type PropTypes = {
  [key: string]: PropType
}

export const getProps = (node: Node): PropTypes => {
  const props = getPropsFromTypeNode(node)
  return props.reduce((acc, prop) => {
    const propData = createPropType(prop)
    return {
      ...acc,
      [propData.name]: propData,
    }
  }, {})
}
