import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

export async function getTeamAlias(teamName: string): Promise<string> {
    const db = getFirestore();
    const aliasesRef = collection(db, 'aliases');
    const q = query(aliasesRef, where('name', '==', teamName));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return teamName;

    const aliasDoc = snapshot.docs[0].data();
    return aliasDoc.alias || teamName;
}