import React, { createContext, useContext, useState, useCallback } from 'react';

const FollowStatusContext = createContext();

export const useFollowStatus = () => {
  const context = useContext(FollowStatusContext);
  if (!context) {
    throw new Error('useFollowStatus must be used within a FollowStatusProvider');
  }
  return context;
};

export const FollowStatusProvider = ({ children }) => {
  const [followStatusMap, setFollowStatusMap] = useState({});

          const updateFollowStatus = useCallback((userId, status) => {
          console.log('FollowStatusContext: Updating follow status for user', userId, 'to', status);
          setFollowStatusMap(prev => {
            const newMap = {
              ...prev,
              [userId]: status
            };
            console.log('FollowStatusContext: New follow status map:', newMap);
            return newMap;
          });
        }, []);

          const getFollowStatus = useCallback((userId) => {
          const status = followStatusMap[userId] || 'none';
          console.log('FollowStatusContext: Getting follow status for user', userId, ':', status);
          return status;
        }, [followStatusMap]);

  const clearFollowStatus = useCallback((userId) => {
    setFollowStatusMap(prev => {
      const newMap = { ...prev };
      delete newMap[userId];
      return newMap;
    });
  }, []);

  const clearAllFollowStatus = useCallback(() => {
    setFollowStatusMap({});
  }, []);

  const value = {
    followStatusMap,
    updateFollowStatus,
    getFollowStatus,
    clearFollowStatus,
    clearAllFollowStatus
  };

  return (
    <FollowStatusContext.Provider value={value}>
      {children}
    </FollowStatusContext.Provider>
  );
};
