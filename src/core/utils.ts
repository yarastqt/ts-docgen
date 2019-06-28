import { Symbol, Node, JSDoc, TypeGuards } from 'ts-morph'

import { Maybe } from './utility-types'

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

export const getPropTypes = (node: Node): PropTypes => {
  const props = getPropsFromTypeNode(node)
  return props.reduce((acc, prop) => {
    const propData = createPropType(prop)
    return {
      ...acc,
      [propData.name]: propData,
    }
  }, {})
}
