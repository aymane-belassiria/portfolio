// src/utils/filesystem.js

export function initializeFilesystem() {
  return {
    root: {
      home: {
        type: 'dir',
        children: {
          documents: {
            type: 'dir',
            children: {}
          },
          projects: {
            type: 'dir',
            children: {}
          }
        }
      },
      var: {
        type: 'dir',
        children: {}
      },
      etc: {
        type: 'dir',
        children: {}
      }
    }
  };
}

export function navigateFS(fs, currentPath, targetDir) {
  const pathSegments = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);

  // Navigate to current path
  let current = fs.root;
  for (const segment of pathSegments) {
    if (current[segment] && current[segment].type === 'dir') {
      current = current[segment].children;
    } else {
      return currentPath; // Invalid current path
    }
  }

  // Check if target directory exists
  if (current[targetDir] && current[targetDir].type === 'dir') {
    const newPathSegments = [...pathSegments, targetDir];
    return newPathSegments.length === 0 ? '/' : '/' + newPathSegments.join('/');
  }

  return currentPath; // Target doesn't exist, stay in current path
}

export function listDirectory(fs, path) {
  const pathSegments = path === '/' ? [] : path.split('/').filter(Boolean);

  // Navigate to the requested path
  let current = fs.root;
  for (const segment of pathSegments) {
    if (current[segment] && current[segment].type === 'dir') {
      current = current[segment].children;
    } else {
      return []; // Path doesn't exist
    }
  }

  // Return directory contents as array of objects
  return Object.entries(current).map(([name, node]) => ({
    name,
    type: node.type
  }));
}

export function getFileContent(fs, path) {
  const pathSegments = path === '/' ? [] : path.split('/').filter(Boolean);
  const fileName = pathSegments.pop();

  if (!fileName) {
    return null; // No file specified
  }

  // Navigate to parent directory
  let current = fs.root;
  for (const segment of pathSegments) {
    if (current[segment] && current[segment].type === 'dir') {
      current = current[segment].children;
    } else {
      return null; // Path doesn't exist
    }
  }

  // Get file content
  if (current[fileName] && current[fileName].type === 'file') {
    return current[fileName].content || '';
  }

  return null; // File doesn't exist
}
