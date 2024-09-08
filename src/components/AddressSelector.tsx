import { AddressAutofill, AddressMinimap, useConfirmAddress } from '@mapbox/search-js-react'
import { useNavigate } from 'react-router-dom';

export function AddressSelector() {
  const navigate = useNavigate();

  return (
    <div className="border rounded-lg mt-4">
      <div className="p-4">
        <label className=" text-sm mb-1 block">Address Search </label>
        <AddressAutofill
              accessToken={import.meta.env.VITE_MAPBOX_API_KEY}
              onRetrieve={(data) => {
                if (data.features.length > 0) {
                  let property = data.features[0];
                  navigate(`/results?lat=${property.geometry.coordinates[1]}&lon=${property.geometry.coordinates[0]}&address=${property.properties.full_address}`);
                }
                console.log(data)
              }}
              options={{country: 'NZ'}}
          >
            <input
              placeholder="Start typing address"
              className="items-center placeholder-blue-600 justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black border h-10 px-4 py-2 block w-full mb-2"
            />
          </AddressAutofill>
        <div className="flex flex-row flex-wrap content-center items-center gap-1 bg-white border-gray-200 shadows-md relative">
        <div className="flex gap-2 items-center p-2 border text-sm rounded-md text-gray-600">
              <img src="./icons/info.svg" className="w-4 h-4" />
              <p>Start typing above to search</p>
            </div>

        </div>
      </div>
    </div>
  );

}