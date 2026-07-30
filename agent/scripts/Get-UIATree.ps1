Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

$root = [System.Windows.Automation.AutomationElement]::RootElement
$condition = [System.Windows.Automation.Condition]::TrueCondition
$walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker

function Get-UIANode($element, $depth) {
    if ($depth -gt 5 -or $null -eq $element) { return $null }

    $rect = $element.Current.BoundingRectangle
    $node = @{
        id = $element.Current.AutomationId
        type = $element.Current.LocalizedControlType
        name = $element.Current.Name
        bounds = @{
            x = $rect.X
            y = $rect.Y
            width = $rect.Width
            height = $rect.Height
        }
        children = @()
    }

    $child = $walker.GetFirstChild($element)
    while ($child -ne $null) {
        $childNode = Get-UIANode $child ($depth + 1)
        if ($null -ne $childNode -and $childNode.bounds.width -gt 0) {
            $node.children += $childNode
        }
        $child = $walker.GetNextSibling($child)
    }

    return $node
}

$tree = Get-UIANode $root 0
$tree | ConvertTo-Json -Depth 6 -Compress
