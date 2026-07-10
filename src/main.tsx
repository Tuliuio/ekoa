import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Workaround for React DOM reconciliation error caused by browser extensions
// that modify the DOM outside of React's control
const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function <T extends Node>(child: T): T {
  if (child.parentNode !== this) {
    if (console) {
      console.warn('Cannot remove child: node is not a child of this node', child);
    }
    return child;
  }
  return originalRemoveChild.call(this, child) as T;
};

const originalInsertBefore = Node.prototype.insertBefore;
Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
  if (referenceNode && referenceNode.parentNode !== this) {
    if (console) {
      console.warn('Cannot insert before: reference node is not a child of this node', referenceNode);
    }
    return newNode;
  }
  return originalInsertBefore.call(this, newNode, referenceNode) as T;
};

createRoot(document.getElementById("root")!).render(<App />);
