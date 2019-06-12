import { resolve } from 'path'
import { getComponentFiles, FilesMap } from '../src/core/walker'

const source = resolve(__dirname, '__fixtures__/Components1')

const replaceSourceFromAllComponents = (source: string, files: FilesMap) => (
  Object.entries((files)).reduce((acc, [key, values]) => ({
    ...acc,
    [key]: values.map((value) => value.replace(source, '')),
  }), {})
)

describe('walker', () => {
  test('should return array of files for all components', async () => {
    let files = await getComponentFiles(source)
    files = replaceSourceFromAllComponents(source, files)

    expect(Object.keys(files).length).toBe(2)
    expect(files.Component1.includes('/Component1/Component1.tsx')).toBeTruthy()
    expect(files.Component1.includes('/Component1/_theme/Component1_theme_b.tsx')).toBeTruthy()
    expect(files.Component1.includes('/Component1/_theme/Component1_theme_a.tsx')).toBeTruthy()
    expect(files.Component2.includes('/Component2/Component2.tsx')).toBeTruthy()
  })

  test('should return array of files for selected component', async () => {
    let files = await getComponentFiles(source, ['Component2'])
    files = replaceSourceFromAllComponents(source, files)

    expect(Object.keys(files).length).toBe(1)
    expect(files.Component2.includes('/Component2/Component2.tsx')).toBeTruthy()
  })
})
