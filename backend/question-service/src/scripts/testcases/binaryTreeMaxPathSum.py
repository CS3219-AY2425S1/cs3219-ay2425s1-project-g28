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
    def max_gain(node):
        nonlocal max_sum
        if not node:
            return 0

        # Recursively calculate the maximum path sum of left and right subtrees
        left_gain = max(max_gain(node.left), 0)  # Ignore negative paths
        right_gain = max(max_gain(node.right), 0)  # Ignore negative paths

        # Current node max path sum includes both left and right contributions
        current_path_sum = node.val + left_gain + right_gain

        # Update the maximum path sum found so far
        max_sum = max(max_sum, current_path_sum)

        # Return the max gain if we continue the same path with this node
        return node.val + max(left_gain, right_gain)

    max_sum = float("-inf")
    max_gain(root)
    return max_sum


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
