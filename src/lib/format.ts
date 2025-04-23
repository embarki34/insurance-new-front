    // Format date if needed
    export const formatDate = (dateString: any) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
        } catch (e) {
            return dateString
        }
    }