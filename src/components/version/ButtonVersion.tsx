import { useState, useEffect } from 'react';


export const VersionSelect = () => {
  const [selectedVersion, setSelectedVersion] = useState('');


  const handleChangeSelect = ({ target }) => {
    const selectedValue = target.value;
    setSelectedVersion(selectedValue);
    if (selectedValue === 'v1.0.0') {
      window.location.assign('https://portafoliov100.vercel.app/');
    }
  };

  useEffect(() => {
    const savedVersion = JSON.parse(localStorage.getItem('version'));
    if (savedVersion === 'v1.0.0') {
      setSelectedVersion('v1.0.1');
    } else {
      setSelectedVersion(savedVersion || 'v1.0.1');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('version', JSON.stringify(selectedVersion));
  }, [selectedVersion]);


  return (
    <form className="flex items-center justify-center max-w-sm mx-auto md:pl-7 pl-3 text-base-300">
      <label>
        <select aria-label="State"
          id="versions"
          className="bg-transparent text-base-content font-semibold rounded-lg block w-full p-2"
          onChange={handleChangeSelect}
          value={selectedVersion}
        >
          <option className="text-base font-semibold" value="v1.0.1">v1.0.1</option>
          <option className='text-base font-semibold' value="v1.0.0">v1.0.0</option>
        </select>
      </label>
    </form>
  );
};
