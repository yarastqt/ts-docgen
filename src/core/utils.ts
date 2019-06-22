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
  const jsDocs = getJsDocFromSymbol(symbol)
  const excludedTags = ['internal', 'private']
  if (!jsDocs) {
    return false
  }
  for (const tag of jsDocs.getTags()) {
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
  const jsDocs = getJsDocFromSymbol(symbol)
  if (!jsDocs) {
    return undefined
  }
  return jsDocs.getComment()
}

export const isOptionalProp = (symbol: Symbol) => {
  // @ts-ignore
  return getDeclaration(symbol).hasQuestionToken()
}

export const getPropTypeData = (symbol: Symbol) => {
  return {
    name: getPropName(symbol),
    description: getPropDescription(symbol),
    optional: isOptionalProp(symbol),
  }
}

type PropType = {
  [key: string]: {}
}

export const getPropTypes = (node: Node): PropType => {
  const props = getPropsFromTypeNode(node)
  return props.reduce((acc, prop) => {
    const propName = getPropName(prop)
    const propData = getPropTypeData(prop)
    return {
      ...acc,
      [propName]: propData,
    }
  }, {})
}
