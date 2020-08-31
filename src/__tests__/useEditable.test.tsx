import { TextField } from '@adobe/react-spectrum'
import { fireEvent, render, RenderResult } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { expectType } from 'tsd'
import { useEditable } from '..'
import { ariaRequired, label, targetValue, testId } from './_utils'

const values = {
  initial: 'initialValue',
  changed: 'changedValue',
  empty: '',
}

const useWrappedEditable = <R extends boolean>(isRequired: R) =>
  useEditable(TextField, values.initial, isRequired, (value, onChange) => ({
    value,
    onChange,
    label,
    'data-testid': testId,
  }))

const expectRawAndFinal = (
  actual: ReturnType<typeof useWrappedEditable>,
  rawValue: any,
  finalValue: any,
) => expect(actual).toMatchObject({ rawValue, finalValue })

describe('hooks', () => {
  test('required', () => {
    const { result } = renderHook(() => useWrappedEditable(true))

    expectType<{ rawValue: string; finalValue: string }>(result.current)
    expect(result.current.props).toMatchObject({
      value: values.initial,
      label,
      isRequired: true,
    })

    expectRawAndFinal(result.current, values.initial, values.initial)

    act(() => result.current.set(values.changed))
    expectRawAndFinal(result.current, values.changed, values.changed)

    act(() => result.current.set(values.empty))
    expectRawAndFinal(result.current, values.empty, values.empty)
  })

  test('optional', () => {
    const { result } = renderHook(() => useWrappedEditable(false))

    expectType<{ rawValue: string; finalValue: string | null }>(result.current)
    expect(result.current.props).toMatchObject({
      value: values.initial,
      label,
      isRequired: false,
    })

    expectRawAndFinal(result.current, values.initial, values.initial)

    act(() => result.current.set(values.changed))
    expectRawAndFinal(result.current, values.changed, values.changed)

    act(() => result.current.set(values.empty))
    expectRawAndFinal(result.current, values.empty, null)
  })
})

describe('render', () => {
  const Wrapper = ({ isRequired }: { isRequired: boolean }) => {
    const field = useWrappedEditable(isRequired)
    return <TextField {...field.props}></TextField>
  }
  const getTargetElement = (result: RenderResult) =>
    result.getByTestId(testId) as HTMLInputElement

  test('required', () => {
    const result = render(<Wrapper isRequired={true}></Wrapper>)
    const input = getTargetElement(result)

    expect(input.getAttribute(ariaRequired)).toBeTruthy()
    expect(input.value).toBe(values.initial)

    fireEvent.change(input, targetValue(values.changed))
    expect(input.value).toBe(values.changed)
  })

  test('optional', () => {
    const result = render(<Wrapper isRequired={false}></Wrapper>)
    const input = getTargetElement(result)

    expect(input.getAttribute(ariaRequired)).toBeFalsy()
    expect(input.value).toBe(values.initial)

    fireEvent.change(input, targetValue(values.changed))
    expect(input.value).toBe(values.changed)
  })
})
