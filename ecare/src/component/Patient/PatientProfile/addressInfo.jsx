import React ,{useState, useEffect }from "react";
import styles from "./addressInfo.module.css";
import EditBox from "../../Common/EditButton/editButton";
import TextInfo from "../../Common/TextInfo";
import TextInput from "../../Common/TestInputPassword";
import PropTypes from "prop-types";
import UpdateButtons from "./UpdateButtons/updateButtons";

const AddressInfo = ({ profileData,isEditing, handleSave, setIsEditing }) => {
  const [formData, setFormData] = useState({
    address: profileData.address || "",
    district: profileData.district || "",
    city: profileData.city || "",
    pincode: profileData.pincode || "",
    phone: profileData.phone || "",
  });

  useEffect(() => {
    const fetchEmail = () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const email = userData?.email || "";
      setFormData((prevState) => ({ ...prevState, email }));
    };

    fetchEmail();
  
  setFormData((prevState) => ({
        ...prevState,
        address: profileData.address || "",
        district: profileData.district || "", 
        city: profileData.city || "",
        pincode: profileData.pincode || "",
        phone: profileData.phone || "",
      }));
    }, [profileData]);
  
    const handleChange = (event) => {
      const { name, value } = event.target;
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    };
  
    const handleCancel = () => {
      setIsEditing(false);
    };
  
    const handleSaveClick = () => {
      handleSave(formData);
      formData.append("email", profileData.email);
    };

  return (
      <div className={styles.infoRoot}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>Address Information</h3>
          {!isEditing && <EditBox onClick={() => setIsEditing(true)} />}
        </div>
        {isEditing ? (
          <>
            <div className={styles.personalInfoRoot}>
              {/* Name Field */}

              <TextInput
                type="text"
                title="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your Address"
                isRequired={true}
              />

              <TextInput
                type="text"
                title="District"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter your District"
                isRequired={true}
              />
  
              
              <TextInput
                type="text"
                title="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your City"
                isRequired={true}
              />
              <TextInput
                type="text"
                title="Pin Code"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter your Pincode"
                isRequired={true}
              />
              <TextInput
                type="text"
                title="Phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                placeholder="Enter your Phone Number"
                isRequired={true}
              />
            </div>
            <UpdateButtons
              handleClickCancel={handleCancel}
              handleClickSave={handleSaveClick}
            />
          </>
        ) : (
          <div className={styles.personalInfoRoot}>
            {/* Display text info when not editing */}
            <TextInfo title="Address" info={formData.address || "N/A"} />
            <TextInfo title="District" info={formData.district || "N/A"} />
            <TextInfo title="City" info={formData.city || "N/A"} />
            <TextInfo title="Pin Code" info={`${formData.pincode || "N/A"} `} />
            <TextInfo title="Phone" info={`${formData.phone || "N/A"} `} />
          </div>
        )}
      </div>
    );
};

export default AddressInfo;

AddressInfo.prototype={
  profileData: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    handleSave: PropTypes.func.isRequired,
    setIsEditing: PropTypes.func.isRequired,
}
