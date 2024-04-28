import { useForm, SubmitHandler } from 'react-hook-form'

const Login = () => {
    const { register, handleSubmit, setError } = useForm();
    const onSubmit: SubmitHandler<any> = (data) => console.log(data)

    return (
        <div className='w-full h-screen bg-zinc-700'>
            <form className='w-1/2 h-1/2 bg-zinc-600' onSubmit={handleSubmit(onSubmit)}>
                <input className='w-full' defaultValue="test" {...register("example")} />
                <input className='w-full' {...register("exampleRequired", { required: true })} />
                <input className='w-1/6 p-5' type="submit" />
            </form>
        </div>
    )
}

export default Login