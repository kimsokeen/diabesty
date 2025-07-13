import { useState } from "react";

function UploadImage() {
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {image && (
        <img src={image} alt="Preview" className="max-w-xs rounded-lg shadow-md" />
      )}
    </div>
  );
}

export default UploadImage;
