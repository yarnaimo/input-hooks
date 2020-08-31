import { defaultTheme, Item, Picker, Provider } from '@adobe/react-spectrum'
import { fireEvent, render, RenderResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { expectType } from 'tsd'
import { useSelectable } from '../hooks'
import { label, targetValue, testId } from './_utils'

const emptyValue = ''
const values = ['a', 'b', 'c'] as const
const options = [
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
  { key: 'c', label: 'C' },
] as const

const useWrappedSelectable = <R extends boolean>(isRequired: R) =>
  useSelectable(
    Picker,
    options,
    values[0],
    isRequired,

    (selectedKey, onSelectionChange) => ({
      selectedKey,
      onSelectionChange,
      label,
      'data-testid': testId,
    }),
  )

const expectRawAndFinal = (
  actual: ReturnType<typeof useWrappedSelectable>,
  rawValue: any,
  finalValue: any,
) => expect(actual).toMatchObject({ rawValue, finalValue })

describe('hooks', () => {
  test('required', () => {
    const { result } = renderHook(() => useWrappedSelectable(true))

    expectType<{
      selectOptions: typeof options
      rawValue: string
      finalValue: typeof values[number]
    }>(result.current)

    expect(result.current.props).toMatchObject({
      selectedKey: values[0],
      label,
      isRequired: true,
    })

    expectRawAndFinal(result.current, values[0], values[0])

    act(() => result.current.set(values[1]))
    expectRawAndFinal(result.current, values[1], values[1])

    act(() => result.current.set(emptyValue))
    expectRawAndFinal(result.current, emptyValue, emptyValue)
  })

  test('optional', () => {
    const { result } = renderHook(() => useWrappedSelectable(false))

    expectType<{
      selectOptions: typeof options
      rawValue: string
      finalValue: typeof values[number] | null
    }>(result.current)

    expect(result.current.props).toMatchObject({
      selectedKey: values[0],
      label,
      isRequired: false,
    })

    expectRawAndFinal(result.current, values[0], values[0])

    act(() => result.current.set(values[1]))
    expectRawAndFinal(result.current, values[1], values[1])

    act(() => result.current.set(emptyValue))
    expectRawAndFinal(result.current, emptyValue, null)
  })
})

describe('render', () => {
  const Wrapper = ({ isRequired }: { isRequired: boolean }) => {
    const field = useWrappedSelectable(isRequired)
    return (
      <Provider theme={defaultTheme}>
        <Picker {...field.props}>
          {field.selectOptions.map(({ key, label }) => (
            <Item key={key}>{label}</Item>
          ))}
        </Picker>
      </Provider>
    )
  }
  const getTargetElement = (result: RenderResult) =>
    result.baseElement.querySelector('select') as HTMLSelectElement

  test('required', () => {
    const result = render(<Wrapper isRequired={true}></Wrapper>)
    const picker = getTargetElement(result)

    expect(picker.selectedIndex).toBe(0)

    fireEvent.change(picker, targetValue(values[1]))
    expect(picker.selectedIndex).toBe(1)
  })

  test('optional', () => {
    const result = render(<Wrapper isRequired={false}></Wrapper>)
    const input = getTargetElement(result)

    expect(input.selectedIndex).toBe(0)

    fireEvent.change(input, targetValue(values[1]))
    expect(input.selectedIndex).toBe(1)
  })
})
