const useCheckAuth = (sheetAccess) => {

  const awaitSheetAccess = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // fix this
  }

  const checkAuth = (sheetId) => {
    sheetId = parseInt(sheetId);

    awaitSheetAccess()

    console.log("Checking Auth for Sheet:", sheetId)

    let index = sheetAccess.findIndex(sheet => sheet.sheet_id === sheetId)

    if (index !== -1) {
      console.log(sheetAccess[index].role_name)
      return(sheetAccess[index].role_name)
    }
  }

  return { checkAuth }
}

export default useCheckAuth