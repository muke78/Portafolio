import { useState } from 'react';

export const VersionSelect = () => {
  const [selectedVersion, setSelectedVersion] = useState('');

  const handleChangeSelect = ({ target }) => {
    const selectedValue = target.value;
    setSelectedVersion(selectedValue);
    if (selectedValue === 'v1.0.0') {
      window.location.assign('https://portafolio-vercel-deploy.vercel.app');
    }
  };

  return (
    <form className="flex items-center justify-center max-w-sm mx-auto md:pl-2 pl-5 text-base-300">
      <select
        id="versions"
        className=" text-base-content rounded-lg block w-full p-2"
        onChange={handleChangeSelect}
        value={selectedVersion}
      >
        <option className="text-sm" value="v1.0.1">
          v1.0.1
        </option>
        <option className='text-sm' value="v1.0.0">v1.0.0</option>
      </select>
    </form>
  );
};
