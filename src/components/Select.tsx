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
        className="text-white mb-2"
      />
      <div className="flex flex-row flex-wrap content-center items-center gap-1">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.value)}
            className="text-white"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
