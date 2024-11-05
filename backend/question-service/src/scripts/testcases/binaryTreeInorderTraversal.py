# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


# Please do not modify the main function
def main():
    root = deserialize(input().strip())
    print(solution(root))


# Write your code here
def solution(root):
    result = []

    def inorder(node):
        if not node:
            return
        inorder(node.left)
        result.append(node.val)
        inorder(node.right)

    inorder(root)
    return result


# Helper function to deserialize input in space-separated format
def deserialize(data):
    if not data:
        return None

    nodes = data.split()
    root = TreeNode(int(nodes[0]))
    queue = [root]
    i = 1

    while queue and i < len(nodes):
        node = queue.pop(0)
        if nodes[i] != "null":
            node.left = TreeNode(int(nodes[i]))
            queue.append(node.left)
        i += 1
        if i < len(nodes) and nodes[i] != "null":
            node.right = TreeNode(int(nodes[i]))
            queue.append(node.right)
        i += 1

    return root


if __name__ == "__main__":
    main()
