import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SheetContext } from '../../../_context/SheetProvider';
import { Div } from '../../../_styles/_global'
import dummyData from '../../../_dummy/users.json';
import edit from '../../../_assets/icons/edit-purple.png'
import useScrollHandler from '../../../_helpers/useScrollHandler';
import '../../../_styles/user-display.css';
import defaultProfileImage from '../../../_assets/img/default-profile-img.png';
import plus from '../../../_assets/icons/plus.png';
import dummySheetAccessData from '../../../_dummy/sheet-access.json';
import UserLookup from './UserLookup';
import { GlobalContext } from '../../../_context/AppProvider'
import smartApi from '../../../_helpers/smartApi';
import toast from 'react-hot-toast'
import { UserAccessContext } from '../../../_context/UserAccessProvider';
import Modal from '../../../_components/Modal';

const UserDisplay = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const { store } = useContext(GlobalContext)
  const { user, setPageView } = store;
  
  const { sheet } = useContext(SheetContext);
  const [ sheetName, setSheetName ] = useState('');
  const [ authLevel, setAuthLevel ] = useState()
  const [ usersChanged, setUsersChanged] = useState(0);
  const [ userDisplayView, setUserDisplayView ] = useState('simple');
  const sheetId = parseInt(location.pathname.split('/')[2]);

  const { userAccess } = useContext(UserAccessContext);
  const { setSheetUsers } = userAccess;
  let usersToUpdate = useRef([]);
  
  const mouseDownHandler = useScrollHandler('scroll-container');

  useEffect(() => {
    setPageView('users')
  }, [])
  
  const [myId, setMyId] = useState(null)

  useEffect(() => {
    smartApi(['GET', `get_user_id`], user.token)
      .then(result => {
        if (result) {
          setMyId(result.id)
        }
      })
      .catch(error => console.log('error', error));
  }, [])

  useEffect(() => {

    let sheetNameResult
    let userAccessResult

    const accessData = smartApi(['GET', `get_sheet_users/${sheetId}`], user.token)
      .then(result => result.length ? (userAccessResult = result) : navigate('/'))
      .catch(error => console.log('error', error))
    
    const sheetData = smartApi(['GET', `get_sheet/${sheetId}`], user.token)
      .then(result => sheetNameResult = result.sheet?.name)
      .catch(error => console.log('error', error))

    Promise.all([sheetData, accessData])
      .then(() => {
        let owners = userAccessResult.filter(user => user.role_name === 'Owner')
        let editors = userAccessResult.filter(user => user.role_name === 'Editor')
        let viewers = userAccessResult.filter(user => user.role_name === 'Viewer')
        setSheetUsers(owners.concat(editors.concat(viewers)))
        setSheetName(sheetNameResult)
        })
      .catch(error => console.log('error', error))

    smartApi(['GET', `authCheck/${sheetId}`], user.token)
      .then(result => {
        setAuthLevel(result);
      })
      .catch(error => console.log('error', error));

  }, [location])

  const getSheetUsers = () => {
    smartApi(['GET', `get_sheet_users/${sheetId}`], user.token)
      .then(result => {
        let owners = result.filter(user => user.role_name === 'Owner')
        let editors = result.filter(user => user.role_name === 'Editor')
        let viewers = result.filter(user => user.role_name === 'Viewer')
        // console.log('Get Sheet Users Called')
        setSheetUsers(owners.concat(editors.concat(viewers)))
        // userAccess.setSheetUsers(result);
        if (result.length === 0) {
          // console.log(result);
          navigate('/')
        } else {
          navigate(location.pathname);
        }
      })
      .catch(error => console.log('error', error));
  }

  const updateUsers = () => {
    let payload = {users: []}
    for (let element of document.getElementsByClassName('role-changed')) {
      // console.log(`Set User ID: ${element.closest('tr').id} to ${element.value}`)
      payload.users.push({user_id: element.closest('tr').id, "role_name": element.value})
    }
    setUsersChanged(0)
    let sheetId = location.pathname.split('/')[2];

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${user.token}`);
    myHeaders.append('Content-Type', 'application/json')

    var requestOptions = {
      method: 'PATCH',
      headers: myHeaders,
      redirect: 'follow',
      body: JSON.stringify(payload)
    };
  
    fetch(`http://localhost:8080/api/edit_user_roles/${sheetId}`, requestOptions)
      .then(response => response.json())
      .then(result => {
        toast.success('User Roles Updated')
        // console.log(result); // user role has been added
        getSheetUsers();
        // window.location.reload();
      })
      .catch(error => console.log('error', error));
  }


  const modalConfirm = useRef(null);
  const modalCancel = useRef(null);
  const modalMessage = useRef(null);
  const [showModal, setShowModal] = useState(false);

  const confirmDelete = (target) => {
    modalConfirm.current = () => { deleteUser(target); setShowModal(false);}
    modalCancel.current = () => setShowModal(false)
    modalMessage.current = {
      title: sheetName,
      body: `Are you sure you want to remove ${target.name}?`,
      tooltip: `They will no longer have access to this sheet`,
      confirm: 'Remove User',
    }
    setShowModal(true)
  }

  const deleteUser = (target) => {
    let payload = {users: [target]}
    let sheetId = location.pathname.split('/')[2];

    smartApi(['DELETE', `remove_roles/${sheetId}`, payload], user.token)
      .then(result => {
        toast.success('User Removed')
        // console.log(result); 
        smartApi(['GET', `get_sheet_users/${sheetId}`], user.token)
        .then(result => {
          let owners = result.filter(user => user.role_name === 'Owner')
          let editors = result.filter(user => user.role_name === 'Editor')
          let viewers = result.filter(user => user.role_name === 'Viewer')
          setSheetUsers(owners.concat(editors.concat(viewers)))
          // userAccess.setSheetUsers(result);
          if (result.length === 0) {
            // console.log(result);
            navigate('/')
          }
        })
        .catch(error => console.log('error', error));
      })
      .catch(error => console.log('error', error));
  }

  return (
    <>
      {authLevel === undefined ? <></> :
      <>
        <div className={`users-display-container ${(location.pathname.split('/').length >= 5 && location.pathname.split('/')[4] === 'lookup' && authLevel === 'Owner') ? 'shrink' : ''}`}>
          <div className='users-display-header'>
            <div className="users-header-meta">
              <div className="users-header-icon">
                <img />
              </div>
              <div className='users-header-title'>
                <span className="page-name nowrap">User Access</span>
                <span className={`sheet-name ${sheetName === '' ? 'filler':''} nowrap`}>{sheetName === '' ? 'Loading...': sheetName}</span>
              </div>
            </div>
            <div className="users-search">
              {/* <input placeholder='Search'/> */}
              {authLevel !== 'Owner' ? <></> : 
                usersChanged <= 0 ? 
                <button className='user-update-button update-disabled' disabled>Update</button> 
                : 
                <button className='user-update-button update-enabled' onClick={updateUsers}>Update</button>}
            </div>
          </div>
          <div id='scroll-container' className='users-display-body' onMouseDown={(e) => {
            store.clickTime.current = new Date();
            mouseDownHandler(e);
          }}>
            {userDisplayView === 'smart' ? 
              // smart view here
              <div>
                Wow!
              </div>
              :
              // simple view here
              <table className='users-display-table'>
                <thead>
                  <tr>
                    <td className='users-display-cell'></td>
                    <td className='users-display-cell'>Name</td>
                    <td className='users-display-cell'>Role</td>
                    <td className='users-display-cell'>E-Mail</td>
                    {authLevel !== 'Owner' ? <></> :
                      <td className='users-display-cell'></td>
                    }
                  </tr>
                </thead>
                <tbody>
                  {userAccess.sheetUsers.map((user,i) => {
                    let roles = ['Owner', 'Editor', 'Viewer']
                    
                    if (user.email === undefined || user.email === null) {
                      user.email = `${user.name.split(' ')[0]}.${user.name.split(' ')[1]}@gmail.com`
                    }
                    if (user.role === undefined) {
                      user.role = user.role_name //fix 
                    }
                    return (
                      <tr id={user.user_id} key={i} className='user-row'>
                        <td className='user-row-picture'><img referrerPolicy="no-referrer" className='user-profile-picture' src={user.picture !== undefined ? user.picture : defaultProfileImage} /></td>
                        <td className='users-display-cell'>{user.name}</td>
                        <td className='users-display-cell'>
                          {authLevel !== 'Owner' || myId === user.user_id ? <span>{user.role}</span> :
                          <select key={`${i}-${user.role}`} defaultValue={user.role} className='users-display-role-select' onChange={(e) => {
                            
                            if (e.target.value !== user.role) {
                              if (!e.target.classList.contains('role-changed')) {
                                e.target.classList.add('role-changed')
                                setUsersChanged(usersChanged + 1)
                                usersToUpdate.current.push({user_id: user.user_id, role_name: e.target.value})
                              }
                            } else {
                              if (e.target.classList.contains('role-changed')) {
                                e.target.classList.remove('role-changed')
                                setUsersChanged(usersChanged - 1)
                                let index = usersToUpdate.current.findIndex(user => user.user_id === user.id)
                                usersToUpdate.current.splice(index, 1);
                              }
                            }
                          }}>
                            {roles.map(role => 
                              <option key={`option-${role}`} className={`${role === user.role ? 'previous-value' : 'other-value'}`}value={role}>{role}</option>)}
                          </select>
                          }
                        </td>
                        <td className='users-display-cell'>
                          {user.email}
                        </td>
                        {authLevel !== 'Owner' ? <></> :
                        myId === user.user_id ? <td></td> : <td className='user-row-option'>
                          <img alt='delete-icon' onClick={() => {confirmDelete(user)}}/>
                          {/* <img alt='delete-icon' onClick={() => {deleteUser(user)}}/> */}
                        </td>
                        }
                      </tr>
                    )}
                    )}
                </tbody>
              </table>
            }
          </div>
        </div>
        {showModal ? <Modal message={modalMessage.current} callback={modalConfirm.current} cancel={modalCancel.current}/> : <></>}
        <UserLookup/>
        {authLevel !== 'Owner' ? <></> :
        <button className='add-user' onClick={() => navigate('lookup')}>
          <span className="no-select">Add User</span><img className='primary-image'/>
        </button>
        }
        {/* <button className='users-display-exit' onClick={
            () => navigate(-1)
          }>&lt;</button> */}
        {/* <button className='toggle-view' onClick={() => 
        userDisplayView === 'smart' ? setUserDisplayView('simple') : setUserDisplayView('smart')}><img /></button> */}
      </>
      }
    </>
  );
}

export default UserDisplay;
//sidebar

//header
//fields
//entries

//detailed



