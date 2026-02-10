let memoryWatchlist = [];

const getWatchlist = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (err) {
    return memoryWatchlist.slice();
  }
  return [];
};

const saveWatchlist = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    memoryWatchlist = list.slice();
  }
};

const toggleWatchlist = (id) => {
  const list = getWatchlist();
  const index = list.indexOf(id);
  if (index >= 0) {
    list.splice(index, 1);
    saveWatchlist(list);
    return false;
  }
  list.push(id);
  saveWatchlist(list);
  return true;
};

const removeFromWatchlist = (id) => {
  const list = getWatchlist().filter((item) => item !== id);
  saveWatchlist(list);
};
