import Image from "next/image";

export const Heroes = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl">
      <div className="flex items-center">
        <div className="relative w-[400px] h-[400px] sm:w-[450px] sm:h-[450px] md:h-[500px] md:w-[500px]">
          <Image
            src="/patients.svg"
            fill
            className="object-contain dark:hidden"
            alt="Patients"
          />
     
        </div>
      
      </div>
    </div>
  )
}