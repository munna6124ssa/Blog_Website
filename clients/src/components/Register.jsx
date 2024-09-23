const Register = () => {
  return (
    <>
    <div className=" h-screen w-full  flex items-center justify-center">
    <div className="bg-white rounded w-1/2 p-9 shadow-md flex flex-col gap-4">
    <div className="">
    <h1 className="text-3xl text-center font-extrabold text-gray-900 mb-4">Register</h1>
    </div>
    <form>
        <div className="flex flex-col gap-4">
      <div className="">
        <label for="name" className="block text-gray-700 font-medium mb-1">Name</label>
        <input type="text" id="name" className="w-full border-gray-300 rounded-md shadow-sm" placeholder="Enter your name" />
      </div>
      <div className="">
        <label for="email" className="block text-gray-700 font-medium mb-1">Email</label>
        <input type="email" id="email" className="w-full border-gray-300 rounded-md shadow-sm " placeholder="Enter your email" />
      </div>
      <div className="">
        <label for="gender" className="block text-gray-700 font-medium mb-1">Gender</label>
        <select id="gender" className="w-full border-gray-300 rounded-md shadow-sm ">
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="">
        <label for="age" className="block text-gray-700 font-medium mb-1">Age</label>
        <input type="number" id="age" className="w-full border-gray-300 rounded-md shadow-sm " placeholder="Enter your age" />
      </div>
      <div className="">
        <label for="password" className="block text-gray-700 font-medium mb-1">Create your Password</label>
        <input type="password" id="password" className="w-full  border-gray-300 rounded-md shadow-sm " placeholder="Enter your password" />
      </div>
      <div className="">
        <label for="profile" className="block text-gray-700 font-medium mb-1">Profile Picture</label>
        <input type="file" id="profile" className="w-full border-gray-300 rounded-md shadow-sm " />
      </div>
      <div className=" flex items-center justify-center">
        <button type="submit" className="w-2/4 bg-indigo-500 text-white font-medium py-2 rounded-md hover:bg-indigo-600">Register</button>
      </div>
      </div>
    </form>
  </div>
</div>
{/* </div> */}
    </>
  )
}
export default Register