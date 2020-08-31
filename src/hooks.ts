import { ComponentProps, ComponentType, ReactText, useState } from 'react'

export type HasIsRequired = ComponentType<
  { isRequired?: boolean } & { children: any }
>

export const useEditable = <C extends HasIsRequired, R extends boolean>(
  Component: C,
  initialValue: string,
  isRequired: R,
  propsMapper: (
    value: string,
    onChange: (value: string) => void,
  ) => Partial<ComponentProps<C>>,
) => {
  const [rawValue, set] = useState<string>(initialValue)
  const props = { ...propsMapper(rawValue, set), isRequired }

  type FinalValue = R extends true ? string : string | null
  const finalValue = (isRequired
    ? rawValue.trim()
    : rawValue.trim() || null) as FinalValue

  return {
    rawValue,
    set,
    finalValue,
    props,
  }
}

export const useSelectable = <
  C extends HasIsRequired,
  T extends readonly { key: string; label: string }[],
  R extends boolean
>(
  Component: C,
  selectOptions: T,
  initialValue: T[number]['key'],
  isRequired: R,
  propsMapper: (
    value: string,
    onChange: (value: ReactText) => void,
  ) => Partial<ComponentProps<C>>,
) => {
  const [rawValue, set] = useState<string>(initialValue)
  const props = {
    ...propsMapper(
      rawValue,
      set as React.Dispatch<React.SetStateAction<ReactText>>,
    ),
    isRequired,
  }

  type FinalValue = R extends true ? T[number]['key'] : T[number]['key'] | null
  const finalValue = (isRequired ? rawValue : rawValue || null) as FinalValue

  return {
    selectOptions,
    rawValue,
    set,
    finalValue,
    props,
  }
}
