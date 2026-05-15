// src/utils/filesystem.js

export function initializeFilesystem() {
  return {
    root: {
      home: {
        type: 'dir',
        children: {
          aymane: {
            type: 'dir',
            children: {
              documents: {
                type: 'dir',
                children: {
                  'aymane belassiria.pdf': {
                    type: 'file',
                    content: '%PDF-1.4\n... PDF content ...'
                  }
                }
              },
              projects: {
                type: 'dir',
                children: {
                  'projects.txt': {
                    type: 'file',
                    content: 'Project 1\nProject 2\nProject 3'
                  }
                }
              },
              'experience.txt': {
                type: 'file',
                content: 'Senior Developer\n5+ years experience'
              }
            }
          }
        }
      },
      bin: {
        type: 'dir',
        children: {
          gh: {
            type: 'file',
            content: '#!/bin/bash\n# GitHub CLI executable'
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
  let pathSegments = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);

  // Handle parent directory (..)
  if (targetDir === '..') {
    if (pathSegments.length > 0) {
      pathSegments.pop();
    }
    return pathSegments.length === 0 ? '/' : '/' + pathSegments.join('/');
  }

  // Handle absolute paths (starting with /)
  if (targetDir.startsWith('/')) {
    pathSegments = targetDir === '/' ? [] : targetDir.split('/').filter(Boolean);
  } else {
    // Handle relative paths
    pathSegments.push(targetDir);
  }

  // Validate the path exists
  let current = fs.root;
  for (const segment of pathSegments) {
    if (current[segment] && current[segment].type === 'dir') {
      current = current[segment].children;
    } else {
      return currentPath; // Invalid target path, stay in current path
    }
  }

  return pathSegments.length === 0 ? '/' : '/' + pathSegments.join('/');
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

  // Return directory contents as array of objects with size property
  return Object.entries(current).map(([name, node]) => ({
    name,
    type: node.type,
    size: node.type === 'dir' ? '-' : (node.content || '').length
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
