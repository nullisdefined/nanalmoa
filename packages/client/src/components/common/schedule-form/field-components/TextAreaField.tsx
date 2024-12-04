import { useFormContext } from 'react-hook-form'
import BaseSection from './BaseSection'

type Prop = {
  id: string
  label: string
  placeholder: string
}

const TextAreaField = ({ id, label, placeholder }: Prop) => {
  const { register } = useFormContext()

  return (
    <BaseSection label={label}>
      <div className="w-full rounded border-2 border-neutral-300 p-3">
        <textarea
          id={id}
          {...register(id)}
          placeholder={placeholder}
          className="h-20 w-full resize-none bg-transparent focus:outline-none"
        ></textarea>
      </div>
    </BaseSection>
  )
}

export default TextAreaField
