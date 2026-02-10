let memoryWatchlist = [];

const resolveStorage = () => {
  try {
    localStorage.setItem("__anime_gold_test__", "1");
    localStorage.removeItem("__anime_gold_test__");
    return localStorage;
  } catch (err) {
    // continue
  }

  try {
    sessionStorage.setItem("__anime_gold_test__", "1");
    sessionStorage.removeItem("__anime_gold_test__");
    return sessionStorage;
  } catch (err) {
    // continue
  }

  return null;
};

const STORAGE = resolveStorage();

const getWatchlist = () => {
  try {
    if (STORAGE) {
      const stored = STORAGE.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
  } catch (err) {
    return memoryWatchlist.slice();
  }
  return memoryWatchlist.slice();
};

const saveWatchlist = (list) => {
  try {
    if (STORAGE) {
      STORAGE.setItem(STORAGE_KEY, JSON.stringify(list));
      return;
    }
  } catch (err) {
    // fallback below
  }
  memoryWatchlist = list.slice();
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
