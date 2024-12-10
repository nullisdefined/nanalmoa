import DownArrowIcon from '@/components/icons/DownArrowIcon'
import { IPartialScheduleForm, ISchedule } from '@/types/schedules'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import CategoryField from './field-components/CategoryField'
import DateTimeField from './field-components/DateTimeField'
import TextAreaField from './field-components/TextAreaField'
import TextInputField from './field-components/TextInputField'
// import GroupField from './field-components/GroupField'
// import RepetitionField from './field-components/RepetitionField'
import { addDays, startOfToday } from 'date-fns'

type Props = {
  defaultValue?: Partial<ISchedule>
  /** form 제출시 실행될 함수 */
  onSubmit: (data: IPartialScheduleForm) => void
  /** 하단 등록하기 버튼 메세지 */
  buttonMessage?: string
}

const ScheduleForm = ({
  defaultValue,
  onSubmit,
  buttonMessage = '등록하기',
}: Props) => {
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)

  const formScheduleCreate = useForm<IPartialScheduleForm>({
    defaultValues: {
      title: "",
      categoryId: 7,
      isAllDay: false,
      startDate: startOfToday(),
      endDate: addDays(startOfToday(), 2),
      place: "",
      memo: "",
      isRecurring: false 
    },
  })

  const handleFormSubmit: SubmitHandler<IPartialScheduleForm> = async (
    data: IPartialScheduleForm,
  ) => {
    const payload = {
      ...data,
      title: data.title ? data.title : '새로운 일정',
    } as IPartialScheduleForm

    onSubmit(payload)
  }

  /** defaultValue가 프로퍼티로 넘어온 경우, 폼을 defaultValue로 초기화 */
  useEffect(() => {
    if (defaultValue) {
      formScheduleCreate.reset({
        title: defaultValue.title,
        categoryId: defaultValue.category?.categoryId,
        isAllDay: defaultValue.isAllDay,
        startDate: new Date(defaultValue.startDate!),
        endDate: new Date(defaultValue.endDate!),
        place: defaultValue.place,
        memo: defaultValue.memo,
        isRecurring: defaultValue.isRecurring,
      })
    }
  }, [defaultValue])

  return (
    <FormProvider {...formScheduleCreate}>
      <form onSubmit={formScheduleCreate.handleSubmit(handleFormSubmit)}>
        <Controller
          control={formScheduleCreate.control}
          name="title"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <TextInputField
              label="일정 제목"
              placeholder="일정 제목을 입력해주세요"
              value={value}
              onChange={onChange}
              error={error}
            />
          )}
        />
        <DateTimeField />

        <Controller
          control={formScheduleCreate.control}
          name="categoryId"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <CategoryField
              value={value}
              onChange={onChange}
              error={error}
            />
          )}
        />

        
        {/* 상세 설정 추가 Dropdown */}
        <div className="rounded border-b border-neutral-200 pb-3">
          <button
            className="flex w-full items-center justify-between pt-4 text-left"
            type="button"
            onClick={() => {
              setIsDetailOpen(prev => !prev)
            }}
          >
            <span className="font-medium">+ 상세 설정 추가</span>
            <DownArrowIcon
              className={`h-5 w-5 transition-transform duration-200 ${
                isDetailOpen ? 'rotate-180 transform' : ''
              }`}
            />
          </button>

          {isDetailOpen && (
            <div className="py-6">
              <Controller
                control={formScheduleCreate.control}
                name="place"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <TextInputField
                    label="장소"
                    placeholder="장소를 입력해주세요"
                    value={value}
                    onChange={onChange}
                    error={error}
                  />
                )}
              />

              {/* <GroupField /> */}
              {/* <RepetitionField /> */}

              <Controller
                control={formScheduleCreate.control}
                name="memo"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <TextAreaField
                    label="메모"
                    placeholder="자유롭게 작성해주세요"
                    value={value}
                    onChange={onChange}
                    error={error}
                  />
                )}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-primary-500 mx-auto mt-5 flex rounded px-4 py-2 text-white"
        >
          {buttonMessage}
        </button>
      </form>
    </FormProvider>
  )
}
export default ScheduleForm
