import { Oval } from "react-loader-spinner";

export default function Loader({ isLoading }: { isLoading: boolean }) {
  return (
    <Oval
      height={80}
      width={80}
      color="#20252e"
      secondaryColor="#495469"
      wrapperStyle={{}}
      wrapperClass="w-full h-full absolute flex justify-center items-center top-0 left-0 bg-white/40"
      visible={isLoading}
      ariaLabel="oval-loading"
      strokeWidth={4}
      strokeWidthSecondary={4}
    />
  );
}
