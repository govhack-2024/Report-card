type SelectProps<T> = {
  onInputChange: (value: string) => void;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
  inputValue: string;
  loading: boolean;
};

export const Select = <T,>({
  onInputChange,
  options,
  onSelect,
  inputValue,
  loading,
}: SelectProps<T>) => {
  return (
    <div className="border rounded-lg mt-4">
      <h2 className="p-4 font-semibold border-b">Address Search</h2>
      <div className="p-4">
        <input
          onChange={(event) => onInputChange(event.target.value)}
          value={inputValue}
          placeholder="Start typing address"
          className="items-center placeholder-blue-600 justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black border h-10 px-4 py-2 block w-full mb-2"
        />
        <div className="flex flex-row flex-wrap content-center items-center gap-1 bg-white border-gray-200 shadows-md relative">
          {inputValue == "" ? (
            <div className="flex gap-2 items-center p-2 border text-sm rounded-md text-gray-600">
              <img src="./icons/info.svg" className="w-4 h-4" />
              <p>Start typing above to search</p>
            </div>
          ) : loading ? (
            <p>Loading</p>
          ) : options.length === 0 ? (
            <p>No Results</p>
          ) : (
            <div className="absolute top-0 h-auto max-h-[40vh] overflow-y-auto border bg-white rounded-sm shadow-md">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(option.value)}
                  className="bg-transparent text-blue-600 hover:underline text-start rounded-none border-b border-gray-200 hover:text-blue-900 last:border-b-0 w-full "
                >
                  {option.label}
                </button>
              ))}{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
