import { resolve } from 'path'
import { getComponentsMap } from '../src/core/walker'
import { extractMetaFromComponents } from '../src/core/parser'
import { jsDocResolver } from '../src/core/resolvers/jsdoc-resolver'

const source1 = resolve(__dirname, '__fixtures__/Module1')

describe('parser', () => {
  describe('jsdoc-resolver', () => {
    test('should return base information from component', async () => {
      const componentsMap = await getComponentsMap(source1)
      const component1FilePath = componentsMap.get('Component1')
      const [componentMeta] = extractMetaFromComponents(component1FilePath!, [jsDocResolver])
      expect(componentMeta!.filePath).toMatch('Module1/Component1/Component1.tsx')
      expect(componentMeta!.description).toBe('Component1 description.')
      expect(componentMeta!.componentName).toBe('Component1')
    })

    test('should return props information from component', async () => {
      const componentsMap = await getComponentsMap(source1)
      const component1FilePath = componentsMap.get('Component1')
      const [componentMeta] = extractMetaFromComponents(component1FilePath!, [jsDocResolver])
      expect(componentMeta!.props).toEqual({
        prop1: {
          name: 'prop1',
          description: 'prop1 description.',
          optional: false,
          defaultValue: undefined,
        },
        prop2: {
          name: 'prop2',
          description: 'prop2 description.',
          optional: true,
          defaultValue: undefined,
        },
      })
    })

    test.skip('should return base information from modifier', async () => {})
    test.skip('should return componentName from displayName', async () => {})
    test.skip('should return defaultValue for prop', async () => {})
    test.skip('should return props without private or internal tags', async () => {})
  })
})
