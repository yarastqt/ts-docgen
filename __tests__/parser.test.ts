import { resolve } from 'path'
import { getComponentsMap } from '../src/core/walker'
import { extractMetaFromComponents } from '../src/core/parser'
import { jsDocResolver } from '../src/core/resolvers/jsdoc-resolver'

type ComponentsMeta = ReturnType<typeof extractMetaFromComponents>

describe('parser', () => {
  describe('jsdoc-resolver', () => {
    let componentsMeta: ComponentsMeta = []

    beforeAll(async () => {
      const source = resolve(__dirname, '__fixtures__/Module1')
      const componentsMap = await getComponentsMap(source)
      const component1FilePath = componentsMap.get('Component1')
      componentsMeta = extractMetaFromComponents(component1FilePath!, [jsDocResolver])
    })

    test('should return base information from component', async () => {
      expect(componentsMeta[0]!.filePath).toMatch('Module1/Component1/Component1.tsx')
      expect(componentsMeta[0]!.description).toBe('Component1 description.')
      expect(componentsMeta[0]!.componentName).toBe('Component1')
    })

    test('should return props information from component', async () => {
      expect(componentsMeta[0]!.props).toEqual({
        prop1: {
          name: 'prop1',
          description: 'prop1 description.',
          optional: false,
          defaultValue: undefined,
        },
        prop2: {
          name: 'prop2',
          description: 'prop2 description.',
          optional: false,
          defaultValue: undefined,
        },
      })
    })

    test('should return defaultValue for prop', async () => {
      expect(componentsMeta[1]!.props).toEqual({
        prop1: {
          name: 'prop1',
          description: undefined,
          optional: false,
          defaultValue: "'value-1'",
        },
        prop2: {
          name: 'prop2',
          description: undefined,
          optional: false,
          defaultValue: "'value-2'",
        },
      })
    })

    // TODO: загружать компоненты по порядку либо разбить на больше фикстур
    // test('should return props without private or internal tags', async () => {
    //   expect(componentsMeta[2]!.props).toEqual({})
    // })

    test('should return information about optional props', async () => {
      expect(componentsMeta[3]!.props).toEqual({
        prop1: {
          name: 'prop1',
          description: undefined,
          optional: false,
          defaultValue: undefined,
        },
        prop2: {
          name: 'prop2',
          description: undefined,
          optional: true,
          defaultValue: undefined,
        },
      })
    })

    test.skip('should return base information from modifier', async () => {})
    test.skip('should return componentName from displayName', async () => {})
  })
})
