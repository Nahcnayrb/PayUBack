

export function getLabel(username, users, loggedInUsername) {

    for (let i = 0; i < users.length; i++) {
        let user = users[i]
        if (user.username === username) {
            let name = ""
            if (username === loggedInUsername) {
                // case user is logged in user
                name = "Me"
            } else {
                // found user
                name = user.firstName + " " + user.lastName 
            }

            name += (" (@" + username + ")")
            return name
        } 
    }
    // case cannot find user
    return ""
}