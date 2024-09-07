type SelectProps<T> = {
  onInputChange: (value: string) => void;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
  inputValue: string;
};

export const Select = <T,>({
  onInputChange,
  options,
  onSelect,
  inputValue,
}: SelectProps<T>) => {
  return (
    <div>
      <input
        onChange={(event) => onInputChange(event.target.value)}
        value={inputValue}
        placeholder="Start typing address"
        className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black border h-10 px-4 py-2 block w-full mt-4 my-2"
      />
      <div className="flex flex-row flex-wrap content-center items-center gap-1 bg-white border-gray-200 shadows-md">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.value)}
            className="bg-transparent text-blue-600 hover:underline text-start border-none rounded-none border-b border-gray-900 hover:text-blue-900"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
