import { resolve } from 'path'
import { getComponentsMap, ComponentsMap } from '../src/core/walker'

const source = resolve(__dirname, '__fixtures__/Module1')

// eslint-disable-next-line no-shadow
const replaceSourceFromPath = (source: string, componentsMap: ComponentsMap) => {
  for (const [key, values] of componentsMap.entries()) {
    componentsMap.set(key, values.map((value) => value.replace(source, '')))
  }
  return componentsMap
}

describe('walker', () => {
  test('should return array of files for all components', async () => {
    let componentsMap = await getComponentsMap(source)
    componentsMap = replaceSourceFromPath(source, componentsMap)

    expect(componentsMap.size).toBe(2)
    expect(
      (componentsMap.get('Component1') as string[]).includes('/Component1/Component1.tsx'),
    ).toBeTruthy()
    expect(
      (componentsMap.get('Component1') as string[]).includes(
        '/Component1/_theme/Component1_theme_b.tsx',
      ),
    ).toBeTruthy()
    expect(
      (componentsMap.get('Component1') as string[]).includes(
        '/Component1/_theme/Component1_theme_a.tsx',
      ),
    ).toBeTruthy()
    expect(
      (componentsMap.get('Component2') as string[]).includes('/Component2/Component2.tsx'),
    ).toBeTruthy()
  })

  test('should return array of files for selected component', async () => {
    let componentsMap = await getComponentsMap(source, ['Component2'])
    componentsMap = replaceSourceFromPath(source, componentsMap)

    expect(componentsMap.size).toBe(1)
    expect(
      (componentsMap.get('Component2') as string[]).includes('/Component2/Component2.tsx'),
    ).toBeTruthy()
  })
})
