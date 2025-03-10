import CategoryTag from '../../CategoryTag'
import { Categories, CategoryEnum } from '@/types/category'
import Select, { components } from 'react-select'
import './react-select.css'
import { FieldError } from 'react-hook-form'

type Props = {
  value: number;
  onChange: (value: number) => void;
  error?: FieldError;
}

const CategoryField = ({
  value,
  onChange,
  error
}: Props) => {

  const categoryOptions = Object.keys(CategoryEnum).map((key, idx) => ({
    value: idx + 1,
    label: key,
  }))

  const CustomPlaceholder = () => (
    <div>
      <span className="hidden sm:inline">카테고리</span>
      <span> 선택</span>
    </div>
  )

  return (
    <div className="mb-4 flex justify-between">
      <div
        className="w-36 py-5 text-base font-bold text-neutral-700"
      >
        카테고리
      </div>

      <div className="py-4">
        <Select
          aria-label="카테고리 선택"
          options={categoryOptions}
          value={categoryOptions.find((option) => option.value === value)}
          onChange={(selectedOption) => {
            if (selectedOption) {
              onChange(selectedOption.value)
            }
          }}
          placeholder={<CustomPlaceholder />}
          classNamePrefix="react-select"
          className="select-placeholder"
          menuPlacement="auto"
          menuPosition="fixed"
          components={{
            Option: ({ ...props }) => (
              <components.Option {...props}>
                <CategoryTag label={props.data.label as Categories} />
              </components.Option>
            ),
            SingleValue: ({ data }) => (
              <CategoryTag
                label={data.label as Categories}
                className="px-2 py-1 text-center sm:text-sm"
              />
            ),
          }}
          styles={{
            placeholder: (base) => ({
              ...base,
              fontSize: 'inherit',
              lineHeight: 'inherit',
            }),
            control: (base) => ({
              ...base,
              height: '36px',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              boxShadow: 'none',
              width: 'auto',
              minWidth: '120px',
              display: 'inline-flex',
              alignItems: 'center',
              '&:hover': {
                borderColor: '#9ca3af',
              },
            }),
            valueContainer: (base) => ({
              ...base,
              padding: '0 8px',
              display: 'flex',
            }),
            singleValue: (base) => ({
              ...base,
              margin: '0',
            }),
            input: (base) => ({
              ...base,
              margin: '0',
              padding: '0',
              caretColor: 'transparent',
            }),
            indicatorSeparator: () => ({
              display: 'none',
            }),
            dropdownIndicator: (base) => ({
              ...base,
              padding: '4px',
            }),
            option: (base) => ({
              ...base,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }),
          }}
        />
        {error && (
          <p className="mt-2 text-xs text-red-600">{error.message}</p>
        )}
      </div>
    </div>
  )
}

export default CategoryField
